pluginManagement {
    repositories {
        // Maven Central mirror first: repo.maven.apache.org rate-limits (HTTP 429) some CI/VM networks.
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
        google()
        mavenCentral()
    }
}

rootProject.name = "WellsBanking"
include(":app")
