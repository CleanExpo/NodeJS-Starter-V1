/**
 * Command Exports
 */

export { devCmds, devInit, devStart, devStop, devStatus, devExec, devWatch, devLint, devFmt } from "./dev";
export { specCmds, specNew, specGet, specSet, specStatus, specList, specValidate, specExport } from "./spec";
export { buildCmds, buildRun, buildCheck, buildAnalyze, buildClean, buildTypecheck, buildBundle, buildTest } from "./build";
export { designCmds, designTokenSet, designTokenGet, designTokenList, designCompNew, designCompGet, designCompList, designExportCss, designExportTailwind } from "./design";
export { archCmds, archAdrNew, archAdrList, archModuleScan, archDepsGraph, archLayerDefine, archLayerValidate, archStats } from "./arch";
export { prodCmds, prodDeploy, prodHealth, prodRollback, prodEnvSet, prodEnvList, prodLogs, prodScale, prodMetrics, prodSsl, prodDomainAdd, prodConfigSave, prodConfigLoad } from "./prod";

import { devCmds } from "./dev";
import { specCmds } from "./spec";
import { buildCmds } from "./build";
import { designCmds } from "./design";
import { archCmds } from "./arch";
import { prodCmds } from "./prod";

export const allCmds = [
  ...devCmds,
  ...specCmds,
  ...buildCmds,
  ...designCmds,
  ...archCmds,
  ...prodCmds,
];
