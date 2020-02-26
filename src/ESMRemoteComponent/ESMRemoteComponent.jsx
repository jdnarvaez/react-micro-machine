import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  server: PropTypes.string,
  stylesheet: PropTypes.string,
  source: PropTypes.string.isRequired,
  loadingComponent: PropTypes.element,
  unloadSourcesOnUnmount: PropTypes.bool
};

class ESMRemoteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  loadSource = () => {
    const { server, source } = this.props;

    if (server && source) {
      const url = `${server}${source}`;

      console.log(`loading ${url}`)

      import(/* webpackIgnore: true */ url).then((module) => {
        try {
          this.setState({ sourceLoaded : true, DynamicComponent : module.default });
        } catch (error) {
          this.setState({ error : error })
        }
      }).catch(err => this.setState({ error : err }))
    }
  }

  loadStylesheet = () => {
    const component = this;
    const { server, stylesheet } = this.props;

    if (server && stylesheet) {
      const href = `${server}${stylesheet}`;

      for (var i = 0; i < document.styleSheets.length; i++) {
        const stylesheetElement = document.styleSheets[i];

        if (stylesheetElement.href === href) {
          var refCount = stylesheetElement.ownerNode.dataset.refCount;

          if (refCount === undefined) {
            stylesheetElement.ownerNode.dataset.refCount = '1';
          } else {
            stylesheetElement.ownerNode.dataset.refCount = (parseInt(refCount) + 1).toString();
          }

          return this.setState({ stylesheetLoaded : true })
        }
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';

      link.onload = function() {
        component.setState({ stylesheetLoaded : true });
      }

      link.href = href;
      link.dataset.refCount = '1';

      this.setState({ link : link }, () => {
        document.getElementsByTagName('HEAD')[0].appendChild(link);
      })
    } else {
      this.setState({ stylesheetLoaded : true })
    }
  }

  unloadStylesheet = () => {
    const { server, stylesheet } = this.props;

    if (server && stylesheet) {
      const href = `${server}${stylesheet}`;

      for (var i = 0; i < document.styleSheets.length; i++) {
        const stylesheetElement = document.styleSheets[i];

        if (stylesheetElement.href === href) {
          var refCount = parseInt(stylesheetElement.ownerNode.dataset.refCount);
          stylesheetElement.ownerNode.dataset.refCount = (refCount - 1).toString();

          if ((refCount - 1) === 0) {
            stylesheetElement.ownerNode.remove();
          }
        }
      }
    }
  }

  componentDidMount() {
    this.loadSource();
    this.loadStylesheet();
  }

  componentWillUnmount() {
    const { unloadSourcesOnUnmount } = this.props;

    if (unloadSourcesOnUnmount) {
      this.unloadStylesheet();
    }
  }

  render() {
    const { stylesheetLoaded, sourceLoaded, DynamicComponent, error } = this.state;

    if (error) {
      throw error;
    }

    const {
      stylesheet,
      loadingComponent,
      ...rest
    } = this.props;

    if (((stylesheet && stylesheetLoaded) || !stylesheet) && sourceLoaded) {
      return (<DynamicComponent {...rest} />)
    }

    if (loadingComponent) {
      return loadingComponent;
    }
  }
}

ESMRemoteComponent.propTypes = propTypes;

export default ESMRemoteComponent;
