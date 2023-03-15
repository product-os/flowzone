target "default" {
  dockerfile = "Dockerfile"
  platforms = [
    "linux/amd64",
    "linux/arm64",
    "linux/arm/v7"
  ]
}

target "amd64" {
  inherits = ["default"]
  platforms = ["linux/amd64"]
}

target "arm64" {
  inherits = ["default"]
  platforms = ["linux/arm64"]
}

target "armv7" {
  inherits = ["default"]
  platforms = ["linux/arm/v7"]
}
