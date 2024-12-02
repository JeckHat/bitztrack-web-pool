export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-stone-100/50 md:min-h-min dark:bg-stone-800/50">
        <h1>Quickstart</h1>
        <h4>
          Get started mining on the Coal Mining Pool easily and quickly by
          following these few steps!
        </h4>
        Step 0: Install Rust
        <p>
          Most users of our Mining Pool will already have Rust installed and
          ready to use on their system. If you do not have Rust installed,
          please run the command below or follow the link below to the Rust
          website for the latest update!
        </p>
        Note: Additional packages such as <code>build-essential</code>
        may be required if you get a CC Linker not found error. Use the second
        command below to fix this error.
      </div>
    </div>
  );
}
