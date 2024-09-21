# 🦕 Cyanea CMS

ACM Cyber's overengineered frontend for Cyanea.


## Development Setup

```sh
git clone https://github.com/pbrucla/cyanea-cms
pnpm install
```

Before you can start hacking, you'll need to add a couple things to the [.env.local](.env.local) file:
- a valid `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` for a GitHub Oauth app. To generate one for debugging, see <https://github.com/settings/developers>.
- a `CYANEA_EVENTS_REPO` with a valid Github `user/repository`, in that format. The repository must contain a `cyanea.json` at its root.

The production credentials are available [here](https://youtu.be/dQw4w9WgXcQ).
