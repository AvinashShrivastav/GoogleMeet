var AppProcess = (function () {

    var serverProcess ;
    var peers_connection_ids = [];
    var peers_connection = [];
    var remote_vid_stream  = [];
    var remote_aud_stream = [];
    var local_div;
    var audio ;
    var isAudioMute = false;


    async function _init(SDP_function, my_conn_id) { 
        serverProcess = SDP_function;
        my_conn_id = my_conn_id;
        eventProcess();
        local_div = document.getElementById("localVideoPlayer");

     }
    function eventProcess() {
        $('#miceMuteUnmute').on('click', async function () {  
            if(!audio){
                await loadAudio();
            }
            })
            if(!audio){
                //left here will continue
            }
    }

    // Define an object named iceConfiguration
    // This object is used to configure the ICE (Interactive Connectivity Establishment) servers for a WebRTC connection
    var iceConfiguration = {
        // The 'iceServers' property is an array of objects, each representing a single ICE server
        'iceServers': [
            {
                // The 'urls' property of each object is the URL of the ICE server
                // Here, the URL is for a STUN server provided by Google
                'urls': 'stun:stun.l.google.com:19302'
            },
            {
                // Another STUN server provided by Google
                'urls': 'stun:stun1.l.google.com:19302'
            }
        ]
    }

    async function setConnection(connId) {
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async () => {
            console.log("Negotiation needed");
            await setOffer(connId);
        }   
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("On ice candidate");
                serverProcess(JSON.stringify({ 'ice': event.candidate }), connId);  // server process is same as sdp_function
            }
        }

        connection.ontrack = (event) => {
            console.log("On track");
            if(!remote_vid_stream[connId]){
                remote_vid_stream[connId] = new MediaStream();
                

            }
            if(!remote_aud_stream[connId]){
                remote_aud_stream[connId] = new MediaStream();
            }

            if(event.track.kind == "video"){
                remote_vid_stream[connId]
                .getVideoTracks().forEach(t => remote_vid_stream[connId].removeTrack(t));
                remote_vid_stream[connId].addTrack(event.track);

                var remoteVideoPlayer = document.getElementById("v_" + connId);
                remoteVideoPlayer.srcObject = null;
                remoteVideoPlayer.srcObject = remote_vid_stream[connId];
                remoteVideoPlayer.load();
            
        }
        else if(event.track.kind == "audio"){  
            remote_aud_stream[connId]
            .getAudioTracks().forEach(t => remote_aud_stream[connId].removeTrack(t));
            remote_aud_stream[connId].addTrack(event.track);
            
            var remoteAudioPlayer = document.getElementById("a_" + connId);
            remoteAudioPlayer.srcObject = null;
            remoteAudioPlayer.srcObject = remote_aud_stream[connId];
            remoteAudioPlayer.load();   
        };




        peers_connection_ids[connId] = connId;
        console.log("Peers connection ids", peers_connection_ids);
        peers_connection[connId] = connection;

        return connection;

    }

    async function setOffer(connId) {
        console.log("Set offer", connId)
        var connection = peers_connection[connId];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(JSON.stringify({ offer:  connection.localDescription }), connId);


    }

    async function SDPProcess(message, from_connid){
        message = JSON.parse(message);
        if(message.answer){
            console.log("Answer", message.answer);
            await peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.answer));

        }
        else if(message.offer){
            console.log("Offer", message.offer);
            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            await peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.offer));
            var answer = await peers_connection[from_connid].createAnswer();
            await peers_connection[from_connid].setLocalDescription(answer);
            serverProcess(JSON.stringify({ answer: answer }), from_connid);
        }

        else if(message.iceCandidate){
            console.log("Ice Candidate", message.iceCandidate);
            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            try{
                await peers_connection[from_connid].addIceCandidate(message.iceCandidate);
            }catch(e){
                console.error("Error adding received ice candidate", e);

            }
        }
        
    }


    return {
        setNewConnection: async function (connId) {
            await setConnection(connId);
        },

        init: async function (SDP_function, my_conn_id) {
           await  _init(SDP_function, my_conn_id);
        },
        processClientFunc: async function (data, from_conn_id) {
            await SDPProcess(data, from_conn_id);
        },
    };
})();

var MyApp = (function () {

    var socket = null;
    var user_id = "";
    var meeting_id = "";

    //Private function to initialize the application
    function init(uid, mid) {
        user_id = uid;
        meeting_id = mid;



        // Create a new WebSocket connection to the server using the WebSocket constructor and the URL of the signaling server
        event_process_for_signaling_server();



    }

    function event_process_for_signaling_server() {


        socket = io.connect();


        var SDP_function = function (data, connId) {
            console.log("SDP Function", data, connId);
            socket.emit('SDPProcess', {
                message: data,
                to_connid: connId
            });
        }


        socket.on("connect", () => {
            // Log a message to the clinet console when the client is successfully connected to the signaling server
            if (socket.connected) {
                console.log("Connected to the server");
                AppProcess.init(SDP_function, socket.id);
                if (user_id != "" && meeting_id != "") {
                    socket.emit('userconnect', {
                        displayName: user_id,
                        meetingid: meeting_id
                    })
                }

            }
        });

        socket.on("inform_others_about_me", (data) => {
            // Log a message to the console when the client receives a message from the signaling server
            console.log("Inform other about me", data);
            addUser(data.other_users_id, data.connId);
            AppProcess.setNewConnection(data.connId);



        });

        socket.on('inform_me_about_other_user', (other_users) => {
            console.log("Inform me about other user", data);
            if(other_users){
                for(var i = 0; i < other_users.length; i++){
                    addUser(other_users[i].user_id, other_users[i].socket_id); //instead of socket_id he used connectionId
                    AppProcess.setNewConnection(other_users[i].socket_id);
                }
            }
            
        });

        socket.on("SDPProcess", (data) => {     
            console.log("SDP Process", data);
            await AppProcess.processClientFunc(data.message, data.from_connid);
        });

    }

    function addUser(other_user_id, connId) {
        // Log a message to the console when a new user is added
        console.log("Adding user", other_user_id);

        // Create a new div element to display the user's name
        var newDivId = $("#otherTemplate").clone();
        newDivId = newDivId.attr("id", connId).addClass("other");
        newDivId.find("h2").text(other_user_id);
        newDivId.find('video').attr('id', "v_" + connId);
        newDivId.find('audio').attr('id', "a_" + connId);
        newDivId.show();

        $('#divUsers').append(newDivId);

    }




    return {
        // The returned object has a method _init which also takes uid and mid as parameters. This method calls the private init function with the provided parameters.

        //Public function to initialize the application
        _init: function (uid, mid) {
            //private function to initialize the application
            init(uid, mid);
        }
    }
}
)();