import camelCase from 'lodash/camelCase';
import kurve_subgraph from '../modules/kurve/subgraph';

const requireModule = require.context('.', false, /\.ts$/);
const modules = {};

requireModule.keys().forEach(fileName => {
  if (fileName === './index.ts') return;
  const moduleName = camelCase(fileName.replace(/(\.\/|\.ts)/g, ''));
  modules[moduleName] = requireModule(fileName).default;
});

modules['kurve_subgraph'] = kurve_subgraph;

export default modules;
