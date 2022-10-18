// https://docs.docker.com/build/customize/bake/file-definition

target "default" {
  context = "./"
  dockerfile = "Dockerfile"
  platforms = [
    "linux/amd64",
    "linux/arm/v7",
    "linux/arm64",
  ]
  cache-from = [
    "ghcr.io/product-os/flowzone:latest",
    "ghcr.io/product-os/flowzone:master"
  ]
}

target "debug" {
  inherits = ["default"]
  args = {
    DEBUG = "true"
  }
}
