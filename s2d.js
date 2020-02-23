const http = require('http');
const readline = require('readline');
const cp = require("clipboardy");
const APIURL = "http://spotizr.com/";
const deezerURL = "https://www.deezer.com/";

const sanitizePlaylistURL = playlist => {
    const index = playlist.indexOf("?si=");

    if (index != -1)
        playlist = playlist.substring(0, index);

    return playlist;
}

const parseArguments = () => {
    const exp = /https?:\/\/open.spotify.com(\/user\/\w+)?\/playlist\/\w+(\?si=\w+)?/;

    if (process.argv.includes('-h'))
        console.log("USAGE\n\ts2d <playlist_url>\nOPTIONS\n\t--print (-p): Prints the output");
    else if (process.argv[2] && process.argv[2].match(exp))
        convert(sanitizePlaylistURL(process.argv[2]));
    else {
        const rl = readline.createInterface(process.stdin, process.stdout);

        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (chunk, key) => {
            if (key && key.ctrl && key.name == 'v')
                rl.write(cp.readSync());
        });

        rl.question('Enter playlist URL: ', input => {
            if (input.match(exp))
                convert(sanitizePlaylistURL(input));
            else {
                console.log("Not a valid playlist URL");
                setTimeout(() => { process.exit() }, 1500);
            }

            rl.close();
        });
    }
}

const convert = async playlist => {
    const playlistData = await getTracks(playlist);
    const tracks = playlistData.ids;
    let output = "";

    tracks.forEach(track => {
        output += `${deezerURL}track/${track};`;
    });

    output = output.substring(0, output.length - 1);

    cp.writeSync(output);
    console.log("\nCopied to clipboard!");

    setTimeout(() => { process.exit() }, 1500);

    if (process.argv.includes("-p") || process.argv.includes("--print"))
        console.log(output);
}

const getTracks = playlist => {
    return new Promise(resolve => {
        http.get(`${APIURL}?spurl=${playlist}`, res => {
            let data = "";

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });
    });
}

parseArguments();
process.on('beforeExit', () => {
    setTimeout(() => { }, 1500);
});