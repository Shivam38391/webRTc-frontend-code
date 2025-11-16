class PeerService {
    peer: any | RTCPeerConnection

    constructor() {

        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                }]
            })
        }
    }




    //for creating anser we need a offer
    async getAnswer(offer: RTCSessionDescriptionInit){
        if(this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await this.peer.createAnswer()
            await this.peer.setLocalDescription(new RTCSessionDescription(answer))
            return answer
        }
    }



    //when call accept set in the local dis
    async setLocalDescription(ans: RTCSessionDescriptionInit){
        if(this.peer) {
          await  this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }





    async getOffer(){
        if(this.peer) {
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))

            return offer
        }
    }

}



export default new PeerService()