import React, { Component } from 'react';
import { compose } from 'recompose';

import { withAuthorization, withEmailVerification } from '../session';
import { withFirebase } from '../firebase';
import $ from 'jquery';

import Timetable from './Timetable';

window.jQuery = $;
window.$ = $;
global.jQuery = $;

class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,              // get user list for modal
      authUser: null,           // get current logged in user
      timetables: [],           // timetable list of current user
      pageReady: false,         // the page is ready
      showingModal: false,      // toggle to show/hide modal
      sharingTimetableId: null, // store timetable to share
      messages: null,           // merge requests from other users
      requireRendering: false,  // require render
      mode: 0,                  // mode of timetable 0: no timetable available, 1: has some timetables
    };

    this.saveTimetable = this.saveTimetable.bind(this);
    this.submitModal = this.submitModal.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.pageReady || nextState.requireRendering;
  }

  componentDidMount() {
    this.props.firebase.users().once('value', snapshot => {
      this.setState({
        users: snapshot.val(),
      });
    });

    this.listener = this.props.firebase.onAuthUserListener((authUser) => {
        this.setState({
          authUser: authUser
        });

        this.props.firebase.timetables(authUser.uid).once('value', snapshot => {
          this.getTimetables(snapshot);
        });

        this.props.firebase.messages(authUser.uid).once('value', snapshot => {
          this.setState({
            messages: snapshot.val(),
          });
        });
      }
    );
  }

  componentWillUnmount() {
    // it will call users() again
    this.props.firebase.users().off();
  }

  render() {
    const { users, messages, authUser, timetables, pageReady, mode, sharingTimetableId } = this.state;

    if (!!pageReady) {
      return (
        <div className="background">
          { !!messages && <MessageList messages={messages} /> }
          {
            !!timetables && timetables.length > 0 ? timetables.map(timetable => (              
              <div className="timetable-wrapper" key={timetable.id}>
                <Timetable key={timetable.id} description={timetable.description} busydays={timetable.busyDays} />
                <div className="center">
                  <button className="btn btn-success" onClick={e => this.saveTimetable(e, this.postTimetableChangeHandler, timetable.id)}>Update Timetable</button>
                  <button className="btn btn-warning" onClick={e => this.showModal(timetable.id)}>Share Timetable</button>
                </div>
              </div>
            )) : (
              <div className="timetable-wrapper">
                <Timetable description="New Timetable" busydays="" />
                <div className="center">
                  { mode == 0 && <button className="btn btn-success" onClick={e => this.saveTimetable(e, this.postTimetableChangeHandler, "")}>Create Timetable</button> }
                  { mode == 1 && (
                    <React.Fragment>
                      <button className="btn btn-success" onClick={e => this.saveTimetable(e, this.postTimetableChangeHandler, sharingTimetableId)}>Update Timetable</button>
                      <button className="btn btn-warning" onClick={e => this.showModal(sharingTimetableId)}>Share Timetable</button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            )
          }
          <Modal title="Share with your friends" show={this.state.showingModal} handleOk={this.submitModal} handleClose={this.hideModal}>
              <input type="hidden" value={authUser.uid} name="from" readOnly />
              <input type="hidden" value={authUser.username} name="fromName" readOnly />
              { !!sharingTimetableId && <input type="hidden" value={sharingTimetableId} name="fromTid" readOnly /> }
              <p>Choose your friend</p>
              {!!users && <UserList users={users} /> }
          </Modal>
        </div>
      )
    } else {
      return null;
    }
  }

  // get all timetables of the current user
  getTimetables = (snapshot) => {
    
    let timetables = [];
    snapshot.forEach(function(data) {
      var obj = {};
      obj.id = data.key;
      obj.busyDays = data.child("busyDays").val();
      obj.description = data.child("description").val();
      timetables.push(obj);
    });
    this.setState({
      timetables: timetables,
      pageReady: true
    });
  };

  saveTimetable = (e, postSavingHandler, tid) => {
    e.preventDefault();

    // reset flag to require rendering
    this.setState({
      requireRendering: true
    });

    let obj = {};
    let busyDays = [];
    
    const { authUser } = this.state;
    const $this = $(e.target);
    const $parent = $this.closest("div.timetable-wrapper");
    const $table = $parent.find("table");
    const $busyCells = $table.find("td.busy");
    const tDescription = $parent.find(".description").html();
    
    $.each($busyCells, function( index, element ){
      busyDays.push($(element).attr("index"));
    });

    if (busyDays.length < 1) {
      alert("Please select at least 1 busy day");
      return;
    }

    obj.busyDays = busyDays.join(",");
    obj.uid = authUser.uid;
    obj.description = tDescription;

    if (Object.keys(obj).length == 0) {
      return;
    }

    if (tid !== undefined && tid !== null && tid !== "") {
      // update existing timetable
      var ref = this.props.firebase.db.ref(`timetables/${tid}`);
      ref.set(obj)
        .then(function() {
          console.log("Updated timetable");
          postSavingHandler(1, tid);
        });
    } else {
      // insert a new timetable
      var ref = this.props.firebase.db.ref('timetables');
      var newTimetableId = ref.push(obj).key;
      console.log("Inserted database with key: " + newTimetableId);
      postSavingHandler(1, newTimetableId);
    }
  };

  postTimetableChangeHandler = (mode, tid) => {
    this.setState({
      requireRendering: true,
      mode: mode,
      sharingTimetableId: tid
    });
  };

  showModal = (tid) => {
    console.log("Show modal");
    this.setState({ 
      showingModal: true,
      sharingTimetableId: tid,
    });
  };

  hideModal = () => {
    console.log("Close modal");
    this.setState({ 
      showingModal: false,
      sharingTimetableId: null,
    });
  };

  submitModal = (event, postSavingHandler) => {
    event.preventDefault();

    if (!this.state.showingModal) {
      console.log("DETECT ERROR: submit form after clicking cancel modal");
      return;
    }

    const fromInput = document.getElementsByName("from");
    var fromValue = "";
    if (fromInput === null || (fromInput != null && fromInput.length < 1)) {
      console.log("No from ID");
      return;
    } else {
      fromValue = fromInput[0].value;
    }

    const fromNameInput = document.getElementsByName("fromName");
    var fromNameValue = "";
    if (fromInput === null || (fromNameInput != null && fromNameInput.length < 1)) {
      console.log("No from ID");
      return;
    } else {
      fromNameValue = fromNameInput[0].value;
    }

    const fromTid = document.getElementsByName("fromTid");
    var fromTidValue = "";
    if (fromTid === null || (fromTid != null && fromTid.length < 1)) {
      console.log("No Timetable ID");
      return;
    } else {
      fromTidValue = fromTid[0].value;
    }
    
    console.log("User is sharing their timetable");
    const $form = $(event.currentTarget);
    const obj = {
      from: fromValue,
      fromName: fromNameValue,
      fromTid: fromTidValue,
      to: $($form.find("select")).val(),
      toName: $form.find("select").find("option:selected").html()
    };

    var ref = this.props.firebase.db.ref('messages');
    ref.push(obj)
      .then(function() {
        console.log("Sent message");
      });
    this.postMessageChangeHandler();
  }

  postMessageChangeHandler = () => {
    this.setState({
      showingModal: false
    });
  };
}

class Modal extends Component {
  constructor(props) {
    super(props);
  }

  render () {
    const showHideClassName = this.props.show ? "modal display-block" : "modal display-none";

    return (
      <div className={showHideClassName}>
        <form onSubmit={this.props.handleOk}>
          <section className="modal-main">
            <div className="modal-header">{this.props.title}</div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={this.props.handleClose}>close</button>
              <button className="btn btn-primary" type="submit">OK</button>
            </div>
          </section>
        </form>
      </div>
    );  
  }
};

const UserList = ({ users }) =>
  <div className="center-on-page">
    <div className="select">
      <select name="to">
        {Object.keys(users).map(key => (
            <option key={key} value={key}>{users[key].username}</option>
          )
        )}
      </select>
    </div>
  </div>

const MessageList = ({ messages }) => (
    <div>
      {Object.keys(messages).map((key, i) => {
        return (
          <div key={key}>
            <i className="material-icons">warning</i> You have <a href={`/view/`+key}>a merge table</a> from {messages[key].fromName}
          </div>
        )}
      )}
    </div>
  )

const condition = authUser => !!authUser;
export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(HomePage);
