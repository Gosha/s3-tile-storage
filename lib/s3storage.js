'use strict';
var debug = require('debug')('s3storage');
var AWS = require("aws-sdk");
var request = require('request');
var superagent = require('superagent');

module.exports = s3Storage;

function s3Storage(config) {
  if(!config) {
    throw new Error('s3storage needs S3 config object');
  }

  if(!(this instanceof s3Storage)) {
    return new s3Storage(config);
  }

  this.config = config;
  //this.s3 = new AWS.S3({
  //  region: config.region
  //});
}


/**
 * Returns stream provided by request with file from S3
 */

s3Storage.prototype.get = function(location) {
  //this.s3.getObject({
  //  Bucket: this.config.bucket,
  //  Key:
  return superagent.get(location);
}


/**
 * Stores a file in S3 and callk callback with upload details
 * @param {Stream} inputStream. Stream to upload from.
 * @param {Function} callback. Function to call with upload details
 *   - {Error} err. Null if nothing bad happened
 *   - {Function} details. Upload details as received from S3.
 *       {
 *         Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
 *         Bucket: 'bucketName',
 *         Key: 'filename.ext',
 *         ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"'
 *       }
 */
s3Storage.prototype.save = function(inputStream, s3Key, callback) {

  var _this = this;

  // Set the client to be used for the upload.
  AWS.config.update(_this.config);

  const s3Object = new AWS.S3({
    params: {
      Bucket: _this.config.bucket,
      Key: s3Key,
      ACL: "public-read",
    },
  });

  debug("Started piping to S3");
  s3Object.upload({ Body: inputStream }).send((error, details) => {
    if (error) {
      debug("Error:");
      debug(error);
      callback(error);
    }

    debug(
      "File %s stored succesfully on bucket %s.",
      details.Key,
      details.Bucket
    );
    callback(null, details, request(details.Location));
  });
}
