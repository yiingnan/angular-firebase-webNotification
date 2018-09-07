import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class MessagingService {

  messaging = firebase.messaging()
  currentMessage = new BehaviorSubject(null)

  constructor(
    private afDB: AngularFireDatabase,
    private afAuth: AngularFireAuth) { }

  /**
   * update token in firebase database
   * 
   * @param userId userId as a key 
   * @param token token as a value
   */
  updateToken(token) {
      console.log('token',token);
    this.afAuth.authState.pipe(take(1)).subscribe(user => {
        console.log('user',user);
        if(!user) return;
            const data = { [user.uid] : token}
            this.afDB.object('fcmTokens/').update(data)
            
    //   const data = new Object;
    //   data[userId] = token
    //   this.afDB.object('fcmTokens/').update(data)
    })
  }

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermission() {
    this.messaging.requestPermission()
      .then(() => {
        console.log('notification permission granted.');
        return firebase.messaging().getToken()
      })
      .then(token => {
        console.log(token)
        this.updateToken(token)
      })
      .catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
  }

  /**
   * hook method when new notification received
   */
  receiveMessage() {
    this.messaging.onMessage((payload) => {
      console.log("new message received. ", payload);
      this.currentMessage.next(payload)
    });
  }
}