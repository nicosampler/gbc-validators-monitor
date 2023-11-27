## Build with low resources

If you are running the bot in a machine with low resources you might get the TSC error 137.
To fix it you can replace the `yarn build` command with this one `npx --node-options=\"--max-old-space-size=256\" tsc --project tsconfig.json && yarn tscpaths -p tsconfig.json -s ./src -o ./dist`
