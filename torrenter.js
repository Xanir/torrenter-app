
var fs = require('fs');
var PATH = require('path');
var WebTorrent = require('webtorrent')

var client = new WebTorrent();

var createDir = function(path) {
	console.info('touch path: ' + path);
	try {
		fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
	} catch (err) {
		fs.mkdirSync(path);
	}
}


var magnetURI = './test/test.torrent'
const DOWNLOAD_FOLDER = PATH.join(__dirname, 'download');
createDir(DOWNLOAD_FOLDER);

client.add(magnetURI, function (torrent) {
	// Got torrent metadata!
	console.log('Client is downloading:', torrent.infoHash)

	torrent.files.forEach(function (file) {
		var pathParts = file.path.split(PATH.sep);
		pathParts = pathParts.filter((pathPart) => {return !!pathPart});
		pathParts.pop();
		pathParts.reduce(
			function(fullPath, pathPart) {
				var path = PATH.join(fullPath, pathPart);
				createDir(path);
			}, DOWNLOAD_FOLDER
		);
		// This opens up the writeable stream to `output`
		var stream = file.createReadStream();
		var writeStream = fs.createWriteStream(PATH.join(DOWNLOAD_FOLDER, file.path));

		// Display the file by appending it to the DOM. Supports video, audio, images, and
		// more. Specify a container element (CSS selector or reference to DOM node).
		stream.pipe(writeStream);
	});

	torrent.on('noPeers', function (announceType) {console.log(announceType)});
	torrent.on('ready', function () {console.log('ready')})
});


const express = require('express')
const app = express();

var extractFileData = function(file) {
	return {
		name: file.name,
		path: file.path,
		length: file.length,
		downloaded: file.downloaded,
		name: file.name,
	}
};

var extractTorrentData = function(torrent) {
	return {
		infoHash: torrent.infoHash, // Info hash of the torrent (string).
		magnetURI: torrent.magnetURI, // Magnet URI of the torrent (string).
		files: torrent.files.map(extractFileData),
		timeRemaining: torrent.timeRemaining, // Time remaining for download to complete (in milliseconds).
		received: torrent.received, // Total bytes received from peers (including invalid data).
		downloaded: torrent.downloaded, // Total verified bytes received from peers.
		uploaded: torrent.uploaded, // Total bytes uploaded to peers.
		downloadSpeed: torrent.downloadSpeed, // Torrent download speed, in bytes/sec.
		uploadSpeed: torrent.uploadSpeed, // Torrent upload speed, in bytes/sec.
		progress: torrent.progress, // Torrent download progress, from 0 to 1.
		ratio: torrent.ratio, // Torrent "seed ratio" (uploaded / downloaded).
		numPeers: torrent.numPeers, // Number of peers in the torrent swarm.
	}
};


app.get('/torrents', (req, res) => res.json(client.torrents.map(extractTorrentData)))


var listener = app.listen(8080, function(){
    console.log('Listening on port ' + listener.address().port);
});