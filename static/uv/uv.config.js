self.__uv$config = {
    prefix: '/service/',
    // Changed from /bare/ to /seal/ to match your index.js
    bare: '/seal/', 
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
    // This tells UV to use the Wisp server your index.js is running
    transport: '/lib/wisp.js', 
};
