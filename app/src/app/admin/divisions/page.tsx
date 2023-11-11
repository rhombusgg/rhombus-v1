import DivisionSwitcher from "./division-switcher";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Divisions</h3>
        <p className="text-sm text-muted-foreground">
          Manage divisions for leaderboards and other features.
        </p>
      </div>
      <DivisionSwitcher />
    </div>
  );
}
