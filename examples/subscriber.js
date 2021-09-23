((red5prosdk) => {
    const subscriber = new red5prosdk.RTCSubscriber();
    const soField = document.getElementById('so-field');
    const SharedObject = red5prosdk.Red5ProSharedObject;
    const sendButton = document.getElementById('send');
    let so = undefined;

    const configuration = {
        protocol: 'wss',
        port: 443,
        host: 'red5stream.searceinc.org',
        app: 'live',
        streamName: 'mystream',
        rtcConfiguration: {
            iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
            iceCandidatePoolSize: 2,
            bundlePolicy: 'max-bundle'
        },
        mediaElementId: 'red5pro-subscriber',
        subscriptionId: 'mystream' + Math.floor(Math.random() * 0x10000).toString(16),
        videoEncoding: 'NONE',
        audioEncoding: 'NONE',
        rtcpMuxPolicy: 'negotiate',

    }

    // Initialize
    subscriber.init(configuration).then(() => {
        console.log("stream published 1")
        subscriber.subscribe();
    }).then(() => {
        console.log("stream published 2")
        establishSharedObject(subscriber);
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });

    const appendMessage = (message) => {
        soField.value = [message, soField.value].join('\n');
    }

    const messageTransmit = (message) => {
        soField.value = ['User "' + message.user + '": ' + message.message, soField.value].join('\n');
    }

    establishSharedObject = (subscriber) => {
        try {
            so = new SharedObject('sharedChatTest', subscriber);
        } catch (err) {
            console.log('error :: ' + err)
        }

        let soCallback = {
            messageTransmit: messageTransmit
        };

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Connect.');
            appendMessage('Connected.');
        });

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Fail.');
        });

        so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Property Update.');
            console.log(JSON.stringify(event.data, null, 2));
        });

        so.on(red5prosdk.SharedObjectEventTypes.METHOD_UPDATE, function (event) {
            console.log('[Red5ProPublisher] SharedObject Method Update.');
            console.log(JSON.stringify(event.data, null, 2));
            soCallback[event.data.methodName].call(null, event.data.message);
        });

    }

    sendButton.addEventListener('click', function () {
        let message = document.getElementById('text-area').value
        if (message != undefined) {
            console.log(message);
            so.send('messageTransmit', {
                user: "mystream",
                message: message
            });
        }
    });
})(window.red5prosdk);
