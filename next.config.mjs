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
  // TODO(arc) remove this after updating cyanea-core to fix the ajv type issue
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
