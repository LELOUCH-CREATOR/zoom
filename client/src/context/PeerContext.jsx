import React, { createContext, useContext, useRef, useState,useEffect } from 'react';
import Peer from 'peerjs';
import { MediaStreamContext } from './MediaStreamContext';

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }) => {
  const { localStreamRef, addRemoteStream } = useContext(MediaStreamContext);
  const [peer, setPeer] = useState(null);
  const peerInstanceRef = useRef(null);  
  const isReconnecting = useRef(false);

  
  const createPeerInstance = () => {
    return new Promise((resolve, reject) => {
      if (peerInstanceRef.current) {
        console.log('Peer instance already exists:', peerInstanceRef.current.id);
        resolve(peerInstanceRef.current);  
        return;
      }

      const newPeer = new Peer({
        host: 'localhost',
        port: 3000,
        path: '/peerjs',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      newPeer.on('open', (id) => {
        console.log('PeerJS ID:', id);
        setPeer(newPeer); 
        peerInstanceRef.current = newPeer;  
        resolve(newPeer); 
      });

      newPeer.on('call', (call) => {
        if (localStreamRef.current) {
          call.answer(localStreamRef.current);  
          call.on('stream', (remoteStream) => {
            console.log(`Received remote stream from ${call.peer}`);
            addRemoteStream(call.peer, remoteStream); 
          });
        }
      });

      newPeer.on('disconnected', () => {
        console.log('Peer disconnected');
        setPeer(null);
        if (!isReconnecting.current) {
          isReconnecting.current = true;
          setTimeout(() => {
            createPeerInstance()
              .then(() => {
                isReconnecting.current = false;
              })
              .catch((err) => console.error('Error reconnecting:', err));
          }, 3000);
        }
      });

      newPeer.on('error', (err) => {
        console.error('PeerJS error:', err);
        reject(err);  
      });
    });
  };


  return (
    <PeerContext.Provider value={{ peer, createPeerInstance }}>
      {children}
    </PeerContext.Provider>
  );
};






