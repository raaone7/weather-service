#!/bin/bash

set -e

cd ..
cd lambda
pnpm build
cp package.json build