import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import type { User } from './principal.types';
import {
  $users,
  $usersHasMore,
  appendUsers,
  beginUsersAppend,
  beginUsersLoad,
  receiveUsers,
  usersAppendStart,
} from './users.store';

function user(name: string): User {
  return {
    type: 'user',
    key: `user:system:${name}` as User['key'],
    displayName: name,
    login: name,
    idProvider: 'system',
    hasPassword: true,
  };
}

function page(names: readonly string[], total = names.length) {
  return ok({ total, items: names.map(user) });
}

describe('users.store', () => {
  it('starts out loading with nothing to show', () => {
    expect($users.get().status).toBe('loading');
    expect($users.get().items).toEqual([]);
    expect($users.get().total).toBe(0);
  });

  it('reports a page as ready, with the size of the whole match beside it', () => {
    receiveUsers(page(['alice', 'bob'], 137));

    const { status, items, total } = $users.get();
    expect(status).toBe('ready');
    expect(items).toHaveLength(2);
    expect(total).toBe(137);
  });

  it('replaces the loaded users on a first page, since the query changed', () => {
    receiveUsers(page(['alice', 'bob'], 137));
    receiveUsers(page(['carol'], 1));

    expect($users.get().items.map(({ login }) => login)).toEqual(['carol']);
    expect($users.get().total).toBe(1);
  });

  it('appends a later page to what is already on screen', () => {
    receiveUsers(page(['alice'], 3));
    appendUsers(page(['bob', 'carol'], 3));

    expect($users.get().items.map(({ login }) => login)).toEqual(['alice', 'bob', 'carol']);
    expect($users.get().total).toBe(3);
  });

  // ! Offset paging over a set someone else is editing can hand back a row already loaded; rendering it
  // ! twice would also make the two rows tick as one.
  it('drops a row the loaded page already carries', () => {
    receiveUsers(page(['alice', 'bob'], 4));
    appendUsers(page(['bob', 'carol'], 4));

    expect($users.get().items.map(({ login }) => login)).toEqual(['alice', 'bob', 'carol']);
  });

  it('takes the total from the newest answer, since a user may have been created meanwhile', () => {
    receiveUsers(page(['alice'], 3));
    appendUsers(page(['bob'], 9));

    expect($users.get().total).toBe(9);
  });

  // ! Keeps the rows, and that is the point: the search runs on the server here, so a debounced keystroke
  // ! reloads — clearing the rows each time would swap the list for a skeleton several times a second and
  // ! lose the scroll position with it. The rows are replaced when the answer lands.
  it('keeps the rows on a first load, and replaces them when the answer lands', () => {
    receiveUsers(page(['alice', 'bob'], 137));
    beginUsersLoad();

    expect($users.get().status).toBe('loading');
    expect($users.get().items).toHaveLength(2);

    receiveUsers(page(['carol'], 1));

    expect($users.get().items.map(({ login }) => login)).toEqual(['carol']);
    expect($users.get().total).toBe(1);
  });

  it('clears a stale message when a load starts, since it belonged to the one that failed', () => {
    receiveUsers(err(new AppError('Principals are unreachable')));
    beginUsersLoad();

    expect($users.get().error).toBeUndefined();
  });

  it('reports no next page while a first one is loading, nor while one is on its way', () => {
    receiveUsers(page(['alice'], 137));
    expect(usersAppendStart()).toBe(1);

    beginUsersAppend();
    expect(usersAppendStart()).toBeUndefined();

    beginUsersLoad();
    expect(usersAppendStart()).toBeUndefined();
  });

  it('reports no next page once every match is loaded', () => {
    receiveUsers(page(['alice', 'bob'], 2));

    expect(usersAppendStart()).toBeUndefined();
    expect($usersHasMore.get()).toBe(false);
  });

  // ! The control's visibility and the request come from the same answer. They did not, and a page that
  // ! added nothing then left `Load more` on screen doing nothing on every click, silently.
  it('reports no next page once an appended page adds no row, whatever the total says', () => {
    receiveUsers(page(['alice'], 137));
    expect($usersHasMore.get()).toBe(true);

    beginUsersAppend();
    appendUsers(page(['alice'], 137));

    expect($users.get().items).toHaveLength(1);
    expect($usersHasMore.get()).toBe(false);
    expect(usersAppendStart()).toBeUndefined();
  });

  // ! The opposite of a first load: the rows on screen stay, because the user is reading them.
  it('keeps the rows while a later page is on its way', () => {
    receiveUsers(page(['alice'], 3));
    beginUsersAppend();

    const { status, items, appending } = $users.get();
    expect(status).toBe('ready');
    expect(items).toHaveLength(1);
    expect(appending).toBe(true);
  });

  it('drops the rows and keeps the message when a first page fails', () => {
    receiveUsers(page(['alice'], 3));
    receiveUsers(err(new AppError('Principals are unreachable')));

    const { status, items, error } = $users.get();
    expect(status).toBe('error');
    expect(items).toEqual([]);
    expect(error).toBe('Principals are unreachable');
  });

  // ! A failed `Load more` must not take the rows the user is already reading with it.
  it('keeps the rows when a later page fails', () => {
    receiveUsers(page(['alice'], 3));
    appendUsers(err(new AppError('Principals are unreachable')));

    const { status, items, appending, error } = $users.get();
    expect(status).toBe('ready');
    expect(items).toHaveLength(1);
    expect(appending).toBe(false);
    expect(error).toBe('Principals are unreachable');
  });
});
