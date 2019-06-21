import React, { Component } from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import { withAuthorization, withEmailVerification } from '../session';
import { withFirebase } from '../firebase';
import $ from 'jquery';

import Timetable from './Timetable';
import Helpers from "./Helpers";

window.jQuery = $;
window.$ = $;
global.jQuery = $;

class ViewPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,     // current authenticated user
      timetables: null,   // list timetables of current user
      enableMerge: false, // only create merged table when we fully get busy days of two timetables
      busyDays: null,     // get total busy days between two timetables
      isMerged: false,    // the message is already merged
      errorOccur: false,  // check there is error occur
      pageReady: false,   // the page is ready
    }
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    this.listener = this.props.firebase.onAuthUserListener((authUser) => {
        this.setState({
          authUser: authUser  
        });

        // set all available timetabes of the current user
        this.props.firebase.timetables(authUser.uid).once('value', snapshot => {
          this.getTimetables(snapshot);
        });

        // only get merge table when user is authenticated
        this.props.firebase.message(id).once('value', snapshot => {
          var isMerged = this.isMergedAlready(snapshot);
          if (!!isMerged) {
            let obj = snapshot.val();
            this.getFromTimetable(obj.fromTid);
            this.getToTimetable(obj.toTid);
            this.renderMergeTimetable();
          } else {
            let obj = snapshot.val();
            // get from timetable
            if (Helpers.isNotEmpty(obj) && Helpers.isNotEmpty(obj.fromTid)) {
              this.getFromTimetable(obj.fromTid);
            }
          }
        });
      }
    );
  }

  render() {
    const { timetables, enableMerge, busyDays, isMerged, errorOccur, pageReady } = this.state;
    const noTimetable = !!timetables && timetables.length > 0;

    if (!errorOccur && !!pageReady) {
      return (
        <div className="background">
          { !isMerged && !!noTimetable && <div>Which timetable would you like to merge?</div> }
          { !isMerged && !!noTimetable && <TemplateList timetables={timetables} /> }
          { !isMerged && !!noTimetable && <button type="button" onClick={this.applyMerge}>Apply</button> }
          { !noTimetable && <p>You don't have any timetable to merge</p> }
          { !noTimetable && (<p>Go back to <Link to={ROUTES.HOME}>HOME</Link> to create one.</p>) }
          
          { !!enableMerge && <Timetable busydays={busyDays} renderBusyDays={false} /> }
        </div>
      )
    } else if(!pageReady) {
      return (
        <div className="background">
          <p>Please wait...</p>
        </div>
      )
    } else {
      return (
        <div className="background">
          <p>Something went wrong</p>
        </div>
      )
    }
  }

  applyMerge = () => {

    var x = document.getElementsByName("toTid");
    if (x === null) {
      return;
    }

    // get message id
    const { id } = this.props.match.params;
    
    // get the current user timetable need to be merged with sender timetable
    const obj = {
      toTid: $("select[name='toTid']").val()
    }
    
    let messageRef = this.props.firebase.db.ref('messages').child(id);
    messageRef.update(obj)
      .then(function() {
        console.log("Message updated");
        return messageRef.once('value');
      }).then(snapshot => {
        const tid = snapshot.val().toTid;
        if(Helpers.isNotEmpty(tid)) {
          this.getToTimetable(tid);
        }
        this.renderMergeTimetable();
      });
  };

  getTimetables = (snapshot) => {
    //console.log(snapshot.val());

    // get all timetables of the current user
    let timetables = [];
    snapshot.forEach(function(data) {
      var obj = {};
      obj.id = data.key;
      obj.description = data.child("description").val();
      timetables.push(obj);
    });
    this.setState({
      timetables: timetables,
      pageReady: true
    });
  };

  getFromTimetable = (tid) => {
    this.changeBusyDays(tid);
  };

  getToTimetable = (tid) => {
    this.changeBusyDays(tid); 
    this.setState({
      isMerged: true
    })
  };

  changeBusyDays = (tid) => {
    this.props.firebase.timetable(tid).once('value', snapshot => {
      let busyDays = this.state.busyDays;
      let dbObj = snapshot.val();
      if (Helpers.isNotEmpty(dbObj)) {
        let newBusyDays = dbObj.busyDays;
        if (Helpers.isNotEmpty(busyDays)) {
          newBusyDays += ",";
          newBusyDays += busyDays;
        }
        this.setState({
          busyDays: this.removeDuplicate(newBusyDays)
        })
      }
    });
  };

  renderMergeTimetable = () => {
    this.setState({
      enableMerge: true
    })
  };

  removeDuplicate = (string) => {
    return string.split(",").filter(function(item, i, allItems){
      return i == allItems.indexOf(item);
      }).join(',');
  };

  isMergedAlready = (snapshot) => {
    var obj = snapshot.val();
    if(!Helpers.isNotEmpty(obj)) {
      this.setState({ 
        errorOccur: true 
      });
      return false;
    }

    var toTid = obj.toTid;
    if(Helpers.isNotEmpty(toTid)) {
      return true;
    } else {
      return false;
    }
  };
}

class TemplateList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { timetables } = this.props;
    return (
      <select name="toTid">
        { !!timetables && timetables.map(timetable => (
            <option key={timetable.id} value={timetable.id}>{timetable.description}</option>
          )
        )}
      </select>
    )
  }
}

export {
  TemplateList
};

const condition = authUser => !!authUser;
export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(ViewPage);