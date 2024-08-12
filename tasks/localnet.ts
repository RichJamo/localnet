import { task } from "hardhat/config";
import { initLocalnet } from "../src";
import { exec } from "child_process";
import waitOn from "wait-on";

const main = async () => {
  console.log("Starting anvil...");

  const anvilProcess = exec("anvil --auto-impersonate");

  if (anvilProcess.stdout && anvilProcess.stderr) {
    anvilProcess.stdout.pipe(process.stdout);
    anvilProcess.stderr.pipe(process.stderr);
  }

  await waitOn({ resources: ["tcp:127.0.0.1:8545"] });

  await initLocalnet();

  process.on("SIGINT", () => {
    console.log("\nReceived Ctrl-C, shutting down anvil...");

    anvilProcess.kill();

    process.exit();
  });

  await new Promise(() => {});
};

task("localnet", "Start localnet", main);
