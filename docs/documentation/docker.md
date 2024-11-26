# Docker

This document describes how you can use [Docker Compose](https://docs.docker.com/compose/)
to try out the new PxWeb 2.0 with your excisting database. The reason we need
Compose is that the new PxWeb access the database through PxWebApi, so we need
to run alt least two containers.

## Prerequisites

- Git client

    - [Install Git](https://github.com/git-guides/install-git)

- Docker CLI - via one of these alternatives:

    - [Docker desktop](https://www.docker.com/products/docker-desktop/) - Docker
      desktop (may require license)
    - [Colima](https://github.com/abiosoft/colima) - Colima command-line tool
    - [Rancher](https://rancherdesktop.io) - Rancher desktop
    - [Podman](https://podman-desktop.io) - Podman desktop

- clone or download this repo <https://github.com/PxTools/PxWebApi>

    ```sh
    git clone https://github.com/PxTools/PxWebApi.git
    ```

## PX-file database

- Obtain a **copy** of a PX-file database from a PxWeb 2023 (or older) installation

- Copy the files to this folder `docker/pxwebapi/Database`

    If you don't have a copy of your database yet, we can continues with a small
    sample database

    ```sh
    cd docker/pxwebapi/Database
    unzip tinydatabase.zip
    ```

    And return to the root folder for the next step

    ```sh
    cd ../../../
    ```

- Start PxWebApi and PxWeb

    ```sh
    docker compose up
    ```

  During (every) startup in this demo, the `Menu.xml` and searchindex `_INDEX`
  folder will be regenerated. This can take some time on lager databases. Since
  we are still in beta, please do not run this on your production servers.

- Your API should now be running on

    - <http://localhost:8081/api/v2>
    - <http://localhost:8081/api/v2/navigation>
    - <http://localhost:8081/api/v2/tables>

- Your PxWeb is also here, but since we have not made the navigation yet, you
  need to obtain the tableId from the API or `Menu.xml` first

    - `http://localhost:8080/table/<tableId>`

    If you used the tinydatabase.zip this is a valid link

    - <http://localhost:8080/table/TAB004>

## CNMM database

comming soon