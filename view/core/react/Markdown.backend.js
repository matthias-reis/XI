/** @jsx React.DOM */
var React = require('react/addons'),
    marked = require('marked'),
    path = require('path');
    fs = require('fs');

var Markdown = React.createClass({
    getInitialState: function() {
        var md = fs.readFileSync(path.join(__dirname, '../..', this.props.md + '.md'), 'utf8');
        return {
            markup: marked(md)
        }
    },
    getMarkup: function () {
        return {__html: this.state.markup}
    },
    render: function () {
        return (
            <section class="markdown" dangerouslySetInnerHTML={this.getMarkup()}>
            </section>
        )
    }
});

module.exports = Markdown;