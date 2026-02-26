/* static/uv/uv.config.js */
self.__uv$config = {
    prefix: '/service/',
    bare: '/seal/',
    // This line solves the "Wisp WebSocket failed" error
    wisp: (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/wisp/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
