/** @jsx React.DOM */
var React = require('react/addons');
var Markdown = require('../../core/react/markdown');

var PageHome =  React.createClass({
    render: function () {
        return (
            <main>
                <h1>Hallo React {this.props.counter}</h1>
                <Markdown md="1/home"/>
            </main>
        )
    }
});

module.exports = PageHome;