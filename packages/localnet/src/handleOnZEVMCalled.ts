import { ethers, NonceManager } from "ethers";
import { handleOnRevertZEVM } from "./handleOnRevertZEVM";
import { log, logErr } from "./log";
import { deployOpts } from "./deployOpts";

// event Called(address indexed sender, address indexed zrc20, bytes receiver, bytes message, uint256 gasLimit, RevertOptions revertOptions);
export const handleOnZEVMCalled = async ({
  tss,
  provider,
  protocolContracts,
  args,
}: {
  tss: any;
  provider: ethers.JsonRpcProvider;
  protocolContracts: any;
  args: any;
}) => {
  log("ZetaChain", "Gateway: 'Called' event emitted");
  try {
    tss.reset();
    const receiver = args[2];
    const message = args[3];
    log("EVM", `Calling ${receiver} with message ${message}`);

    const executeTx = await protocolContracts.gatewayEVM
      .connect(tss)
      .execute(receiver, message, deployOpts);

    const logs = await provider.getLogs({
      address: receiver,
      fromBlock: "latest",
    });

    logs.forEach((data) => {
      log("EVM", `Event from contract: ${JSON.stringify(data)}`);
    });
    await executeTx.wait();
  } catch (e) {
    const revertOptions = args[5];
    await handleOnRevertZEVM(
      revertOptions,
      e,
      tss,
      log,
      protocolContracts,
      deployOpts
    );
  }
};
