import sources from './sources-out.json';
// sourceStats are generated automatically, but we want to combine them here
import sourceStats from './source-stats.json';
console.log({sources});
console.log({sourceStats});
export default sources.map(source => ({
    ...{ ... source, crosswalk: source.crosswalk || {} },
    ...(sourceStats[source.id])
}));
