/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pbrucla/cyanea-core"],
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:(fs\/promises|path)/,
        (/** @type {import('webpack').ResolveData} */ resource) => {
          if (resource.context.endsWith("@pbrucla/cyanea-core/util")) {
            resource.request = "/cyanea-core-node-polyfill"
          }
        },
      ),
    )

    return webpackConfig
  },
}

export default nextConfig
