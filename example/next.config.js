/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/supabase/:path*',
          destination:
            'https://supabase-cookie-auth-proxy.alaister.dev/supabase/:path*',
        },
      ],
    }
  },
}
