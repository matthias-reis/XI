/** @jsx React.DOM */
var React = require('react/addons');
var Markdown = require('../../core/react/Markdown.backend');

var PageHome =  React.createClass({
    render: function () {
        return (
            <main>
                <h1>Hallo React {this.props.counter}</h1>
                <Markdown md="1/md/home"/>
            </main>
        )
    }
});

module.exports = PageHome;