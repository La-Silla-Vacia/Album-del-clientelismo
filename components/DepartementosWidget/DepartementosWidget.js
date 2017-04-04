import React from 'react';
import cx from 'classnames';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
import Widget from '../Widget';
import Legend from '../Legend';
import Select from '../Select';
import s from './DepartementosWidget.css';

class Navigation extends React.Component {

  constructor() {
    super();

    this.state = {
      departementos: [],
      departemento: 'Antioquia',
      columns: 0,
      legendItems: [],
      context: [],
      loading: true,
      data: [],
      hoverIndex: false,
      activeRow: 999,
      activeContent: ''
    };


    this.processData = this.processData.bind(this);
    this.switchOption = this.switchOption.bind(this);
    this.callback = this.callback.bind(this);
  }

  componentWillReceiveProps(newprops) {
    if (newprops.data.length) {
      this.setState({loading: false});
      this.processData(newprops.data);
    }
  }

  processData(data, newDepartemento) {
    const thisdata = [];
    const departementos = [];
    const legendItems = [];
    let departemento = this.state.departemento;
    if (newDepartemento) departemento = newDepartemento;

    for (let i = 0; i < data.length; i += 1) {
      const thisDepart = departemento.toLowerCase();
      const newDepart = data[i].departamento.toLowerCase();

      if (thisDepart === newDepart) {
        thisdata.push(data[i]);
      }

      let inLegend = false;
      const partido = data[i].partido;
      legendItems.map((item) => {
        if (item.name == partido)
          inLegend = true;
      });
      if (!inLegend) legendItems.push({name: partido, colorPartido: data[i].colorPartido});

      let inDepartamento = false;
      const departamento = data[i].departamento;
      departementos.map((item) => {
        if (item.label == departamento)
          inDepartamento = true;
      });
      if (!inDepartamento) departementos.push({label: departamento, value: departamento});
    }

    const columnCount = thisdata.length;
    this.setState({
      columns: columnCount,
      legendItems: legendItems,
      departementos: departementos,
      data: thisdata
    });

    this.mergeData(thisdata);
  }

  mergeData(newData) {
    let data = this.state.data;
    if (newData) data = newData;

    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];

      item.PartidoEscaped = item.partido.replace(/ /g, '');
      // console.log(item);
      let budgetWidth = item.presupuestoDeInversion;
      // budgetWidth = budgetWidth.replace('$', '').replace('"', '');
      budgetWidth = (budgetWidth / 1000000000) * 1.25;
      if (budgetWidth < 35) budgetWidth = 35;
      const halfBudgetWidth = budgetWidth / 2;

      item.BudgetWidth = budgetWidth;
      item.halfBudgetWidth = halfBudgetWidth;

      item.itterator = i;

      if (item.fotoDeLaCabeza === '') item.fotoDeLaCabeza = 'http://archivo.lasillavacia.com/archivos/historias/clientelismo2017/padrinos/1.jpg';
      if (item.fotoDelPadrino === '') item.fotoDelPadrino = 'http://archivo.lasillavacia.com/archivos/historias/clientelismo2017/padrinos/1.jpg';
    }

    this.setState({context: data});
  }

  callback(type, index) {
    if (type == 'click') {
      this.handleClick(index);
    } else {
      this.handleMouseEnter(index);
    }
  }

  handleClick(index) {
    if (this.state.activeRow == index) {
      this.setState({activeRow: 999});
    } else {
      const parrafo = this.state.context[index].parrafo;
      const content = md.render(parrafo);
      this.setState({
        activeRow: index,
        activeContent: content
      });
    }
  }

  handleMouseEnter(index) {
    this.setState({hoverIndex: index});
  }

  getPadrinos() {
    return this.state.context.map((padrino, index) => {
      return (
        <RowColumn
          key={index}
          hoverActive={index == this.state.hoverIndex}
          currentActive={index == this.state.activeRow}
          index={index}
          callback={this.callback}>
          <div className={s.column__inner}>
            <figure className={s.person__avatar}>
              <img src={ padrino.fotoDelPadrino } width="100" alt={ padrino.padrino }/>
            </figure>
            <h3 className={s.person__name}>{ padrino.padrino }</h3>
            <p className={s.person__function}>{ padrino.cargoDelPadrino }</p>
          </div>
        </RowColumn>
      )
    });
  }

  getCabezas() {
    return this.state.context.map((cabeza, index) => {
      return (
        <RowColumn
          key={index}
          hoverActive={index == this.state.hoverIndex}
          currentActive={index == this.state.activeRow}
          index={index}
          callback={this.callback}
          customClass={s.personSmall}
        >
          <div className={s.column__inner}>
            <figure className={s.person__avatar}>
              <img src={ cabeza.fotoDeLaCabeza } width="100" alt={ cabeza.nombreDeLaCabeza}/>
            </figure>
            <h3 className={s.person__name}>{ cabeza.nombreDeLaCabeza }</h3>
            <p className={s.person__function}>{ cabeza.cargoDeLaCabeza }</p>
          </div>
        </RowColumn>
      )
    })
  }

  getPresupuests() {
    return this.state.context.map((item, index) => {
      let inversion;
      if (item.presupuestoDeInversion) {
        inversion = (
          <div>
            <div className={s.budget__circle}/>
            <div className={s.budget__spend}
                 style={{
                   width: `${item.BudgetWidth}px`,
                   height: `${item.halfBudgetWidth}px`,
                   borderRadius: `${item.BudgetWidth}px ${item.BudgetWidth}px 0 0`
                 }}/>
          </div>
        )
      }

      return (
        <div key={index}
             className={cx(
               s.row__column,
               s.columnLineCenter,
               s.budget,
               {[s.hover]: this.state.hoverIndex == index},
               {[s.row__columnOpen]: this.state.activeRow == index}
             )}
             style={{
               color: item.colorPartido,
               minHeight: `${item.halfBudgetWidth}px`
             }}
             onClick={this.handleClick.bind(this, index)}
             onMouseEnter={this.handleMouseEnter.bind(this, index)}
        >
          <div className={s.column__inner}>
            {inversion}
          </div>
        </div>
      )
    });
  }

  getEntidades() {
    return this.state.context.map((item, index) => {
      let logo = (<span className={s.imgFallback}>{ item.entidad }</span>);
      if (item.logo) {
        logo = (<img src={ item.logo } width="50" alt={ item.entidad }/>);
      }

      let presupuestoDeInversion = (<span className={s.destination__amound}>Sin definir</span>);
      if (item.presupuestoDeInversion) {
        presupuestoDeInversion = (<span
          className={s.destination__amound}>{this.formatCurrency(item.presupuestoDeInversion)}<br/> millones</span>)
      }

      return (
        <div key={index}
             className={cx(
               s.row__column,
               s.destination,
               {[s.hover]: this.state.hoverIndex == index},
               {[s.row__columnOpen]: this.state.activeRow == index}
             )}
             onClick={this.handleClick.bind(this, index)}
             onMouseEnter={this.handleMouseEnter.bind(this, index)}
        >

          <div className={s.column__inner}>
            <figure className={s.destination__brand} style={{color: item.colorPartido}}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.53 49.16">
                <path style={{fill: 'currentColor'}}
                      d="M20,48.69,1.78,38.17A3.55,3.55,0,0,1,0,35.1v-21A3.55,3.55,0,0,1,1.78,11L20,.48a3.55,3.55,0,0,1,3.55,0L41.75,11a3.55,3.55,0,0,1,1.78,3.08v21a3.55,3.55,0,0,1-1.78,3.08L23.54,48.69A3.55,3.55,0,0,1,20,48.69Z"/>
              </svg>
              {logo}
            </figure>
            <p className={s.destination__title}>{ item.entidad }</p>
            {presupuestoDeInversion}
          </div>
        </div>
      )
    })
  }

  formatCurrency(value) {
    if (value) {
      const number = Math.round(value / 1000000);
      return "$" + number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
    } else {
      return ""
    }
  }

  switchOption(e) {
    this.setState({departemento: e.value, activeRow: 999});
    this.processData(this.props.data, e.value);
  }

  render() {
    const padrinos = this.getPadrinos();
    const cabezas = this.getCabezas();
    const presupuests = this.getPresupuests();
    const entidades = this.getEntidades();

    const select = (
      <Select
        className={s.select}
        value="Antioquia"
        options={this.state.departementos}
        callback={this.switchOption}
      />
    );

    let loadText;
    if (this.state.loading) {
      loadText = (
        <div className={cx(s.row__column, s.loading, s.row__columnTitle)}>
          <h2 className={s.row__title}>Cargando visualización...</h2>
        </div>
      )
    }

    return (
      <Widget
        upperTitle="Las entidades y sus padrinos"
        upperDescription="No todas las cabezas de las entidades tienen padrino, ni todas las relaciones con ellos son iguales, ni la plata que manejan es la misma. Encuentre acá todos esos datos (en el filtro de la derecha puede cambiar de región). Haga click en el gráfico para leer la información detallada."
        title="Filtre por"
        select={select}
        floatTitle
      >

        <div className={cx(
          s.container,
          {[s[`colCount_${this.state.columns}`]]: true},
          {[s.containerOpen]: this.state.activeRow !== 999}
        )}>

          <div className={s.legend}>
            <Legend
              items={this.state.legendItems}
            />
          </div>

          <div className={s.tableLayout}>

            <div id="padrinos" className={s.row}>
              {loadText}
              <div className={cx(
                s.row__column,
                s.row__columnTitle
              )}>
                <h2 className={s.row__title}>Padrino</h2>
              </div>
              {padrinos}
            </div>

            <div id="cabezas" className={s.row}>
              <div className={cx(
                s.row__column,
                s.row__columnTitle
              )}>
                <h2 className={s.row__title}>Cabezas</h2>
              </div>
              {cabezas}
            </div>

            <div id="presupuests" className={cx(s.row, s.rowLineBelow, s.presupuests)}>
              <div className={cx(
                s.row__column,
                s.row__columnTitle
              )}>
                <h2 className={s.row__title}>Presupuesto <br />de inversión</h2>
              </div>
              {presupuests}
            </div>

            <div id="destinations" className={s.row}>
              <div className={cx(
                s.row__column,
                s.row__columnTitle)}>
                <h2 className={cx(
                  s.row__title,
                  s.visuallyHidden)}>Entidad</h2>
              </div>
              {entidades}
            </div>

            <div
              className={cx(
                s.content,
                {[s.contentHidden]: this.state.activeRow === 999}
              )}
            >
              <header className={s.content__header}>
                <h2 style={{opacity: 0, visibility: 'hidden'}}>La historia</h2>
                <button onClick={this.handleClick.bind(this, this.state.activeRow)} className={s.content__closeButton}>
                  <svg className={s.closebtn} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                    <path className="a"
                          d="M17.45,6.84,12.5,11.79,7.55,6.84l-.71.71,4.95,4.95L6.84,17.45l.71.71,4.95-4.95,4.95,4.95.71-.71L13.21,12.5l4.95-4.95Z"/>
                    <path className="a"
                          d="M12.5,0A12.5,12.5,0,1,0,25,12.5,12.5,12.5,0,0,0,12.5,0Zm0,24A11.5,11.5,0,1,1,24,12.5,11.53,11.53,0,0,1,12.5,24Z"/>
                  </svg>
                </button>
              </header>
              <div className={s.content__inner} dangerouslySetInnerHTML={{__html: this.state.activeContent}}/>
            </div>
          </div>
        </div>

      </Widget>
    );
  }
}


class RowColumn extends React.Component {

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
  }

  handleClick() {
    this.props.callback('click', this.props.index);
  }

  handleMouseEnter() {
    this.props.callback('mouseEnter', this.props.index);
  }

  render() {
    return (
      <div
        className={cx(
          s.row__column,
          s.person,
          s.personWidthArrow,
          {[s.hover]: this.props.hoverActive},
          {[s.row__columnOpen]: this.props.currentActive},
          this.props.customClass
        )}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Navigation;
