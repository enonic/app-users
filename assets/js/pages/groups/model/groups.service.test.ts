import { atom } from 'nanostores';
import { okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  $groupDetail,
  forgetGroups,
  showGroup,
} from '../../../entities/principal/model/group-detail.load';
import { $groups } from '../../../entities/principal/model/groups.store';
import type { Group, GroupDetail } from '../../../entities/principal/model/principal.types';
import type { TopicHandlers } from '../../../shared/admin-events';
import { requestGraphQlDocument } from '../../../shared/api';
import type { HostFrame } from '../../../shared/host';
import { setPhrases } from '../../../shared/i18n';
import { startGroupsEvents, stopGroupsEvents } from './groups.service';
import { groupsSelection } from './selection.store';

// Only the hub client and the transport are stood in for: the chain from message to screen is real.
const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/admin-events/admin-events', () => ({ subscribeTopic }));

vi.mock('../../../shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../shared/api')>()),
  requestGraphQlDocument: vi.fn(),
}));

const WINDOW_MS = 300;
const DEBOUNCE_MS = 250;
const DEVS = 'group:system:devs';

function group(name: string, description?: string): Group {
  return {
    type: 'group',
    key: `group:system:${name}` as Group['key'],
    displayName: name,
    description,
  };
}

function wireGroup(name: string, description: string | null) {
  return { key: `group:system:${name}`, displayName: name, description };
}

function wireDetail(name: string, description: string | null) {
  return { ...wireGroup(name, description), members: [], roles: [], groups: [] };
}

function answerServer(description: string): void {
  vi.mocked(requestGraphQlDocument).mockImplementation(
    (document: string) =>
      okAsync(
        document.includes('members')
          ? { group: wireDetail('devs', description) }
          : { group: wireGroup('devs', description) },
      ) as never,
  );
}

function hub(): TopicHandlers {
  const handlers = subscribeTopic.mock.calls[0]?.[1] as TopicHandlers | undefined;
  if (handlers === undefined) {
    throw new Error('nothing subscribed');
  }
  return handlers;
}

function frame(): HostFrame {
  return {
    $visible: atom(true),
    $itemId: atom<string | undefined>(DEVS),
    closeItem: vi.fn(),
    notify: vi.fn(),
  } as unknown as HostFrame;
}

beforeEach(() => {
  vi.useFakeTimers();
  setPhrases({ 'principal.notify.deletedElsewhere': '"{0}" has been deleted' }, 'en');
  subscribeTopic.mockReturnValue(() => {});
});

afterEach(() => {
  stopGroupsEvents();
  forgetGroups();
  groupsSelection.clear();
  $groups.set({ status: 'loading', items: [] });
  vi.mocked(requestGraphQlDocument).mockReset();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('startGroupsEvents', () => {
  it('re-reads the changed row and the open panel from one `updated`', async () => {
    $groups.set({ status: 'ready', items: [group('devs', 'old')] });
    answerServer('old');
    showGroup(DEVS);
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(($groupDetail.get().item as GroupDetail | undefined)?.description).toBe('old');

    startGroupsEvents(frame());
    answerServer('new');

    hub().onMessage({ operation: 'updated', changes: [{ kind: 'group', key: DEVS }] });
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect($groups.get().items[0]?.description).toBe('new');
    expect(($groupDetail.get().item as GroupDetail | undefined)?.description).toBe('new');
  });

  it('applies nothing while the section is hidden', async () => {
    $groups.set({ status: 'ready', items: [group('devs', 'old')] });
    const hidden = frame();
    (hidden.$visible as ReturnType<typeof atom<boolean>>).set(false);
    startGroupsEvents(hidden);
    answerServer('new');

    hub().onMessage({ operation: 'updated', changes: [{ kind: 'group', key: DEVS }] });
    await vi.advanceTimersByTimeAsync(WINDOW_MS + DEBOUNCE_MS);

    expect(requestGraphQlDocument).not.toHaveBeenCalled();
    expect($groups.get().items[0]?.description).toBe('old');
  });
});
