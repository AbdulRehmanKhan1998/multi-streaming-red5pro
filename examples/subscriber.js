((red5prosdk) => {
    const subscriber = new red5prosdk.RTCSubscriber();
    const SharedObject = red5prosdk.Red5ProSharedObject;
    const sendButton = document.getElementById('send');

    const configuration = {
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        // protocol: 'ws',
        // port: 5080,
        // host: 'localhost',
        app: 'live',
        streamName1: 'mystream1',
        streamName2: 'mystream2',
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
        console.log('LOG :: Subscribe Init Done')
        subscriber.subscribe();
    }).then(() => {
        console.log('LOG :: Subscribe Done')
        establishSharedObject(subscriber);
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });


    const messageTransmit = (message) => {
        var div = document.getElementById("messages");
        var input = document.createElement("textarea");
        input.id = "so-field" + Math.random().toString(16).slice(2)
        input.setAttribute('enabled', true);
        div.appendChild(input);
        const soField = document.getElementById(input.id);
        soField.value = ['User "' + message.user + '": ' + message.message];
    }

    const establishSharedObject = (subscriber) => {
        try {
            so = new SharedObject('sharedObjectTest', subscriber);
        } catch (err) {
            console.log('error :: ' + err)
        }

        const soCallback = {
            messageTransmit: messageTransmit
        };
        // var hasRegistered=false;
        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Connect.');
            window.alert("connected")
            
        });

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Fail.');
        });

        so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Property Update.');
            console.log(JSON.stringify(event.data, null, 2));
            // if (event.data.hasOwnProperty('count')) {
            //     console.log('User count is: ' + event.data.count + '.')
            //     if (!hasRegistered) {
            //       hasRegistered = true
            //       so.setProperty('count', parseInt(event.data.count) + 1)
            //     }
            //   }
            //   else if (!hasRegistered) {
            //     hasRegistered = true
            //     so.setProperty('count', 1)
            //   }
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
                user: "Student",
                message: message
            });
        }
    });
    // console.log(subscriber.getPeerConnection())



})(window.red5prosdk);
