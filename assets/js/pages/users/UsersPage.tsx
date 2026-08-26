import { useI18n } from '../../shared/i18n';

export function UsersPage() {
  const heading = useI18n('users.heading');

  return (
    <div className="text-main flex min-h-0 flex-1 flex-col gap-2 p-6">
      <h2 className="text-2xl font-semibold">{heading}</h2>
      <p className="text-subtle text-sm">
        The Users section, served from this app and mounted by the app-settings shell.
      </p>
    </div>
  );
}
