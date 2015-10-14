import React from 'react'
import { Router, Route, Link } from 'react-router'

export default React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">Brand</a>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li><Link to="/">home</Link></li>
              <li><Link to="/page1">page1</Link></li>
              <li><Link to="/page2">page2</Link></li>
              <li><a href="/page1">page1 (server)</a></li>
            </ul>

            <ul className="nav navbar-nav navbar-right">
              <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                   aria-expanded="false">Help <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  <li><a href="/static/help">Help</a></li>
                  <li><a href="/static/about">About</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});