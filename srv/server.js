const cds = require('@sap/cds');
const express = require('express');
cds.on('bootstrap', (app) => {
  const LOG = cds.log("srv.customServer");
  LOG.info("Custom server bootstrap, built-in types: ");
})