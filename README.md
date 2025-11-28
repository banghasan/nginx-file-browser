# nginx file browser

This web application is a very simple file browser which can be used
effectively together with [nginx's autoindex module](http://nginx.org/en/docs/http/ngx_http_autoindex_module.html).

![nginx file browser in action - light theme](assets/screenshot-light.jpg)
![nginx file browser in action - light theme](assets/screenshot-dark.jpg)

A sample nginx configuration is also included which mounts **file browser** under root (`/`) and mounts files to be listed under `/files` path. Hence is the `filesBaseUrl` under

> Version note: the latest release adds multi-architecture build support (amd64 + arm64) for both the root and rootless Dockerfiles. For Indonesian readers, see [README.id.md](README.id.md).

## Using with docker

Mainly for demonstration purposes a docker image is also available [here](https://hub.docker.com/r/banghasan/nginx-file-browser/).
In order to use this docker image, the volume which has to be served should
be mounted under `/opt/www/files/` and port `80` (root) or `8080` (rootless)) of container shall be mapped
to a proper port on host. A proper run would look like:

root
```
$ docker run -p 8080:80 -v /path/to/my/files/:/opt/www/files/ banghasan/nginx-file-browser
```
rootless:
```
$ docker run -p 8080:8080 -v /path/to/my/files/:/opt/www/files/ banghasan/nginx-file-browser
```

### Using Docker Compose

```
services:
  file-browser:
    image: banghasan/nginx-file-browser:latest
    ports:
      - "8080:80"   # change host port if needed
    volumes:
      - /path/to/my/files/:/opt/www/files/:ro

  file-browser-rootless:
    image: banghasan/nginx-file-browser:latest-rootless
    ports:
      - "8081:8080" # rootless image exposes 8080 inside the container
    volumes:
      - /path/to/my/files/:/opt/www/files/:ro
```

Save this as `docker-compose.yml` (or `compose.yaml`) and run `docker compose up -d`
to start both variants. Remove the service you don't need if you're only
running one of them.

With container up and running you can point your browser to IP of docker host with given port to view the files. For example with above run command assuming docker host having IP with `192.168.0.200` we have to navigate to this URL:

`http://192.168.0.200:8080`

## Building for arm64 and multi-arch

Both Dockerfiles now opt into BuildKit's platform awareness so the same
definition can emit native x86_64 and arm64 images. The easiest way to
produce/publish a multi-arch image is via `docker buildx`:

```
# once per machine
docker buildx create --use --name file-browser-builder

# root (port 80)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <your-registry>/nginx-file-browser:latest \
  -f Dockerfile \
  --push .

# rootless (port 8080)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <your-registry>/nginx-file-browser:rootless \
  -f Dockerfile-rootless \
  --push .
```

If you only need an arm64 image locally you can replace `--platform` with
`--platform linux/arm64` and append `--load` to import it into the local
Docker daemon without pushing it anywhere.

### Dedicated arm64 Dockerfile

For environments that require a pre-built arm64-only image (without manifest
lists) you can build `Dockerfile-arm64`, which forces the arm64 base image and
is published by `.github/workflows/docker-image-arm64.yml` as
`banghasan/nginx-file-browser:latest-arm64`.

## Local validation & CI

HTML/CSS/JS linting as well as a lightweight Playwright end-to-end test now
ship with the repo. Run the checks locally with:

```
npm ci
npx playwright install chromium
npm run lint
npm run test:e2e
```

GitHub Actions executes the same commands on every push and pull request via
`.github/workflows/ci.yml`, ensuring regressions are caught before Docker
images are published.


## Symlinks

> Be very careful with symlinks, they can expose very important files of system to outside world!

If you have symlinks inside files dir that you want to be able to browse too, the alias path where `/files` is served by nginx has to be changed to match the same path outside your docker container. Lets say I have a directory with path `/home/myuser/files-to-serve/`. Which has two directories named `dir1` and `dir2`. where `dir1` is nothing more than a symlink to `dir2`. In order to be able to browse `dir1` (inside `dir2`) on file browser, following have to be done:

Inside `default.conf` this line
```
    alias /opt/www/files/;
```

shall be changed to
```
    alias /home/myuser/files-to-serve/;
```

And the mounting point is now `/home/myuser/files-to-serve/` instead of `/opt/www/files/`.
