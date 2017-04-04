import React from 'react';
import d3 from 'd3';
import cx from 'classnames';
import 'whatwg-fetch';
import Legend from '../Legend';
import Widget from '../Widget';
import Select from '../Select';
import s from './PresupuestoWidget.css';

class PresupuestoWidget extends React.Component {
  constructor() {
    super();
    this.state = {
      selectOptions: [
        {
          label: "Partidos Políticos",
          value: "partidoPolitico",
        },
        {
          label: "Departamentos",
          value: "departamento"
        },
        {
          label: "Entidades",
          value: "entidade"
        }
      ],
      viewType: "partidoPolitico",
      legendItems: [],
      hovering: false,
      data: [],
      formattedData: [],
      nodes: []
    };

    this.createWidget = this.createWidget.bind(this);
    this.switchOption = this.switchOption.bind(this);
  }

  switchOption(e) {
    this.setState({ viewType: e.value });
    setTimeout(() => {
      this.formatData(this.state.data);
    }, 10);
  }

  componentDidMount() {
    this.formatData(this.state.data);
    window.addEventListener('resize', this.createWidget.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data });
    this.formatData(nextProps.data);
  }

  createWidget() {
    const nodes = [];
    const data = this.state.formattedData;
    this.setState({ 'legendItems': data.legendItems });

    const tree = {
      "children": data.children
    };

    let width = window.innerWidth,
      height = window.innerHeight / 3 * 2;

    if (width > 1280) {
      width = 1280;
    }

    const div = d3.select("#presupuestoChart")
      .style("height", height + 'px');


    const treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function (d) {
        return d.presupuestoDeInversion;
      });

    const node = div.datum(tree).selectAll(".node")
      .data(treemap.nodes)
      .enter()
      .append("div")
      .call(this.getPosition)
      .text((d) => {
        nodes.push(d);
      })
      .remove();

    this.setState({ nodes });
  }

  formatData(data) {
    const children = [];
    const legendItems = [];
    let i = 0;

    const sortBy = this.state.viewType;

    data.map((el, index) => {
      let category = el.partido;
      if (sortBy == "departamento") {
        category = el.departamento;
      } else if (sortBy == "entidade") {
        category = el.entidad
      }

      const presupuesto = el.presupuestoDeInversion;

      // only continue if there is money involved
      if (presupuesto) {

        let inChildren = false;
        children.map((child) => {
          if (child.categoryName == category) {
            inChildren = true;
            child.presupuestoDeInversion += Number(presupuesto);
          }
        });

        if (!inChildren) {
          i += 1;

          let color = el.colorPartido;
          if (sortBy == "entidade") {
            color = this.shadeColor("#cd2851", -(i * 3));
          } else if (sortBy == "departamento") {
            color = this.shadeColor("#44a5db", -(i * 3));
          }

          const newEl = {
            partido: el.partido,
            categoryName: category,
            color: color,
            departamento: el.departamento,
            presupuestoDeInversion: el.presupuestoDeInversion,
            id: i
          };

          children.push(newEl);
          legendItems.push({ name: category, colorPartido: color, nodeId: index + 1 });
        }
      }
    });

    this.setState({ formattedData: { children, legendItems } });
    setTimeout(() => {
      this.createWidget();
    }, 10);
  }

  getPosition() {
    this.style("right", (d) => {
      return d.x + "px";
    })
      .style("top", (d) => {
        return d.y + "px";
      })
      .style("width", (d) => {
        return Math.max(0, d.dx) + "px";
      })
      .style("height", (d) => {
        return Math.max(0, d.dy) + "px";
      });
  }

  mouseMove(e) {
    // console.log(e.target);
  }

  getNodes() {
    return this.state.nodes.map((node, index) => {
      let backgroundColor = node.color;

      const fontSize = Math.max(20, 0.05 * Math.sqrt(node.area)) + 'px';
      const amoundOfMoney = Math.round(node.presupuestoDeInversion / 1000000000);

      let hideTitle = false;
      if (node.dx < 200 || node.dy < 130) hideTitle = true;

      let hideMoney = false;
      if (node.dx < 200 || node.dy < 130) hideMoney = true;
      // console.log(node);
      return (
        <div
          onMouseEnter={this.mouseMove}
          className={s.node}
          key={index}
          style={{
            backgroundColor: backgroundColor,
            fontSize: fontSize,
            height: node.dy,
            width: node.dx,
            right: node.x,
            top: node.y,
          }}
        >
          <div className={cx({ [s.tooltip]: hideTitle })}>
            <h3 className={cx(s.partido, { [s.partido__hidden]: hideTitle })}>{node.categoryName}</h3>
            <span className={cx(s.money, { [s.money__hidden]: hideMoney })}>{amoundOfMoney} Mil Millones</span>
          </div>
        </div>
      )
    });
  }

  render() {
    const select = (
      <Select
        className={s.select}
        value="Partidos Políticos"
        options={this.state.selectOptions}
        callback={this.switchOption}
      />
    );

    let nodes;
    if (this.state.nodes.length) nodes = this.getNodes();

    return (
      <Widget
        upperTitle="Presupuesto"
        upperDescription="Al sumar todo el presupuesto les va mejor a algunos partidos, y tienen más pesos algunas entidades y algunos departamentos."
        title="Filtre por %s"
        select={select}
        floatTitle
        id="presupuesto"
      >

        <div className={s.legend}>
          <Legend
            items={this.state.legendItems}
            hovering={this.state.hovering}
          />
        </div>

        <div id="presupuestoChart" className={s.widget}>{nodes}</div>

      </Widget>
    );
  }

  shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    let RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    let GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    let BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  }

}

export default PresupuestoWidget;
