import React, { Component } from 'react';
import Helpers from "./Helpers";

class Timetable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeStamps : [ "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
      ]
    };
  }

  render() {
    return (
      <React.Fragment>
        <p className="description">{this.props.description}</p>
        <table className="tg" align="center">
          <thead>
            <tr>
              <th className="tg-ae17">Time</th>
              <th className="tg-xa3o">Mon</th>
              <th className="tg-xa3o">Tue</th>
              <th className="tg-xa3o">Wed</th>
              <th className="tg-xa3o">Thu</th>
              <th className="tg-xa3o">Fri</th>
              <th className="tg-xufm">Sat</th>
              <th className="tg-xufm">Sun</th>
            </tr>
          </thead>
          <tbody>
            {this.createTable(this.state.timeStamps, this.props.busydays, this.props.renderBusyDays)}
          </tbody>
        </table>
      </React.Fragment>
    );
  }

  /*
   * Create table with time stamps and busy days
   * timeStamps - the start time and end time with a period of 1 hour e.g. 07:00, 08:00
   * busyDays - the days which is marked as 'busy', notice that is stored as a position in 2-d array
   * renderBusyDays - if it is true, we render busy days, otherwise we render free days
   */
  createTable = (timeStamps, busyDays, renderBusyDays = true) => {
    let table = [];
    // 7 days a week
    let column_length = 7;
    // add time column
    column_length += 1;
    // array of busy days
    let busyArr = [];
    if (Helpers.isNotEmpty(busyDays)) {
      busyArr = busyDays.split(",");
      console.log("busy days: " + busyDays);
    }

    // iterate timestamps to generate row
    for (let i = 0; i < timeStamps.length; i++) {
      let children = []
      // iterate columns to generate column
      for (let j = 0; j < column_length; j++) {
        if (j == 0) {
          children.push(
            <td key={j}>{timeStamps[i]}</td>
          )
        } else {
          let index = (j-1) + (i*7) + "";
      
          // allow click event on user timetable
          if (renderBusyDays) {
            if (busyArr.indexOf(index) != -1) {
              children.push(
                <td key={j} className="busy" onClick={e => this.onCellClick(e)} index={index}>
                  &nbsp;
                </td>
              )
            } else {
              children.push(
                <td key={j} onClick={e => this.onCellClick(e)} index={index}>
                  &nbsp;
                </td>
              )
            }
          } 
          // don't allow click event on merged timetable
          else {
            if (busyArr.indexOf(index) == -1) {
              children.push(
                <td key={j} className="free" index={index}>
                  &nbsp;
                </td>
              )
            } else {
              children.push(
                <td key={j} index={index}>
                  &nbsp;
                </td>
              )
            }
          }
          
        }
      }
      //Create the parent and add the children
      table.push(<tr key={i}>{children}</tr>)
    }
    return table;
  }

  onCellClick(e) {
    e.preventDefault();
    // click
    if (e.target.className.indexOf("busy") == -1) {
      e.target.className = "busy";
    }
    // unclick
    else {
      let className = e.target.className.replace("busy", "");
      e.target.className = className;
    }
  }
}

export default Timetable;