#!/usr/bin/env bash
echo "[db:reset]"
dropdb repowatch_dev
createdb repowatch_dev
psql -f schema.sql repowatch_dev
psql -f seed.sql repowatch_dev