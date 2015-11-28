/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import { mapValues, reduce, isFunction, extend, isUndefined, clone } from 'lodash';
import AdrenalineConnector from './AdrenalineConnector.jsx';
import shallowEqual from '../utils/shallowEqual';
import getDisplayName from '../utils/getDisplayName';
import createAdaptorShape from '../adaptor/createAdaptorShape';
import createStoreShape from '../store/createStoreShape';

export default function createSmartComponent(DecoratedComponent, specs) {
  const displayName = `SmartComponent(${getDisplayName(DecoratedComponent)})`;
  invariant(!!specs,
    "Adrenaline smart component requires configuration.");
  invariant(!!specs.initialVariables ? !specs.variables : !!specs.variables,
    "Must specify either initialVariables or variables options, but not both.");
  invariant(!!specs.variables ? isFunction(specs.variables) : true,
    "Variables must be defined as a function of props, otherwise simply declare 'initialVariables'.");

  return class extends Component {
    static displayName = displayName
    static DecoratedComponent = DecoratedComponent

    static propTypes = {
      Loading: PropTypes.func,
      adrenaline: createAdaptorShape(PropTypes),
      store: createStoreShape(PropTypes)
    }

    static contextTypes = {
      Loading: PropTypes.func,
      adrenaline: createAdaptorShape(PropTypes),
      store: createStoreShape(PropTypes)
    }

    static childContextTypes = {
      Loading: PropTypes.func.isRequired,
      adrenaline: PropTypes.object.isRequired,
      store: createStoreShape(PropTypes).isRequired
    }

    constructor(props, context) {
      super(props, context);
      this.adrenaline = this.props.adrenaline || this.context.adrenaline;
      this.store = this.props.store || this.context.store;
      this.Loading = this.props.Loading || this.context.Loading;

      const initialVariables = specs.initialVariables || specs.variables || this.props;
      this.state = {
          uncommittedVariables: isFunction(initialVariables) ? initialVariables(props) : initialVariables
      };

      DecoratedComponent.prototype.setVariables = this.setVariables.bind(this);

      this.mutations = mapValues(specs.mutations, m => {
        return (params, files) => {
            const { adrenaline, store } = this
            adrenaline.performMutation(store, m, params, files);
        }
      });
    }

    setVariables(nextVariables){
      const uncommittedVariables = extend(this.state.uncommittedVariables, nextVariables);
      this.setState({ uncommittedVariables: clone(uncommittedVariables) }, () => this.fetch());
    }

    componentWillMount(){
        this.fetch();
    }

    componentWillReceiveProps(nextProps) {
        if(isFunction(specs.variables)
            && nextProps != this.props
            && !shallowEqual(nextProps, this.props)){
            this.setVariables(specs.variables(nextProps))
        }
    }

    /*shouldComponentUpdate(nextProps) {
      return !shadowEqualScalar(this.props, nextProps);
    }*/

    fetch() {
      const variables = this.state.uncommittedVariables;
      const { adrenaline, store } = this;
      const { query } = specs;

      adrenaline.performQuery(store, query, variables)
        .then(({query, variables})=>{
          // commit the newly loaded variables
          this.setState({ variables: clone(variables) || null });
        })
        .catch(({query, variables})=>{
          console.error('Query failed with variables', query, variables);
        });
    }

    renderDecoratedComponent({variables, props}){
      return (
        <DecoratedComponent {...this.props} {...props}
          adrenaline={extend({}, this.state, {variables, slice: props})}
          mutations={this.mutations} />
      )
    }

    render() {
      const dataLoaded = !isUndefined(this.state.variables);
      if (!dataLoaded) {
        const { Loading } = this;
        return <Loading />;
      }
      const { store, adrenaline } = this;
      const { variables } = this.state;

      return (
        <AdrenalineConnector
            store={store}
            adrenaline={adrenaline}
            query={specs.query}
            variables={variables}>
          {this.renderDecoratedComponent.bind(this)}
        </AdrenalineConnector>
      );
    }
  };
}
