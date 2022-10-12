// stolen from https://stackoverflow.com/questions/46926033/create-seamless-loop-of-audio-web
import Song from './assets/loop.ogg';

const ctx = new AudioContext();
let audioData: AudioBuffer, srcNode;

export async function load() {
    const songData = await fetch(Song, {mode: "cors"});
    const dataBuffer = await songData.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(dataBuffer);
    audioData = audioBuffer;
}

export function playInBuffer() {
    if (!audioData) throw new Error("load sample first!");
    loopBuffer(audioData);
}

function loopBuffer(buffer: AudioBuffer): void {
    srcNode = ctx.createBufferSource();
    srcNode.buffer = buffer;
    srcNode.connect(ctx.destination);
    srcNode.loop = true;
    srcNode.start();
}