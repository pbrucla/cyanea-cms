const no = () => {
  throw "cyanea-core-node-polyfill: this should never be called"
}
const u = new Proxy(
  {},
  {
    get: no,
    apply: no,
  },
)

export { no as opendir, no as join }
export default u
