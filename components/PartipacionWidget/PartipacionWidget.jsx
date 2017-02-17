import React from 'react';
import d3 from 'd3';
import sankeyLib from '../Sankey/Sankey.js';
import Widget from '../Widget';
import Select from '../Select';
import Legend from '../Legend';
import Item from './Item.jsx';
import Node from './Node.jsx';
import s from './PartipacionWidget.css';

class PartipacionWidget extends React.Component {

  constructor() {
    super();
    this.state = {
      selectOptions: [
        {
          label: "Entidades",
          value: "entidades"
        },
        {
          label: "Departamentos",
          value: "departementos"
        }
      ],
      legendItems: [],
      hovering: false,
      items: [],
      nodes: [],
      nodeActive: [],
      activeText: "Cargando visualización...",
      activeAmount: "",
      chartWidth: 1200,
      chartHeight: 1000,
      viewType: "entidades",
    };

    this.switchOption = this.switchOption.bind(this);
    this.getHoverItem = this.getHoverItem.bind(this);
    this.getHoverNode = this.getHoverNode.bind(this);
    this.getHoverLegend = this.getHoverLegend.bind(this);
  }

  switchOption(e) {
    this.setState({viewType: e.value});
    setTimeout(() => {
      console.log(this.state.viewType);
      this.createWidget(this.props.data);
    }, 10);
  }

  getItems() {
    return this.state.items.map((item, index) => {
      const strokeWidth = Math.max(1, item.dy);
      const data = {
        path: item.path,
        strokeWidth,
        color: item.source.colorPartido,
        sourceName: item.source.name,
        targetName: item.target.name,
        value: item.value,
        hoverCallback: this.getHoverItem,
        index
      };

      const sourceId = item.source.nodeId;
      const entidadId = item.source.nodeId;
      const entidadTargetId = item.target.nodeId;

      if ((
        this.state.nodeActive.indexOf(sourceId) !== -1 ||
        this.state.nodeActive.indexOf(entidadId) !== -1) &&
        this.state.madeActiveBy == "node") {
        data.active = true;
      }

      if (
        this.state.nodeActive.indexOf(entidadTargetId) !== -1 &&
        this.state.madeActiveBy == "entidad") {
        data.active = true;
      }

      return (
        <Item key={index} {...data} />
      )
    });
  }

  getHoverItem(index) {
    const item = this.state.items[index];
    const text = `${item.source.name} → ${item.target.name}`;
    const amount = this.formatCurrency(item.theValue);
    this.setState({activeText: text});
    this.setState({activeAmount: amount});

    this.setState({nodeActive: [item.source.nodeId, item.target.nodeId]});
    this.setState({madeActiveBy: "item"})
  }

  getHoverNode(type, id) {
    const activeNodes = [id];
    let value = 0;
    let title = "";

    this.state.nodes.map((node) => {
      if (node.nodeId == id) {
        title = node.name;
        if (type == "partido") {
          node.sourceLinks.map((link) => {
            activeNodes.push(link.target.nodeId);
            value += link.value;
          });
          this.setState({madeActiveBy: "node"});
        } else {
          node.targetLinks.map((link) => {
            activeNodes.push(link.source.nodeId);
            value += link.value;
          });
          this.setState({madeActiveBy: "entidad"});
        }
      }
    });

    this.setState({nodeActive: activeNodes});
    this.setState({activeText: title});
    this.setState({activeAmount: this.formatCurrency(value)});
  }

  getHoverLegend(id) {
    this.setState({nodeActive: [id]});

    let value = 0;
    let title = "";
    this.state.nodes.map((node) => {
      if (node.nodeId == id) {
        title = node.name;

        node.sourceLinks.map((link) => {
          value += link.value;
        })
      }
    });

    this.setState({activeText: title});
    this.setState({activeAmount: this.formatCurrency(value)});
  }

  getNodes() {
    return this.state.nodes.map((item, index) => {
      const data = item;
      data.active = false;
      data.hoverCallback = this.getHoverNode;

      if (this.state.nodeActive.indexOf(data.nodeId) !== -1 ||
        this.state.nodeActive.indexOf(data.nodeId) !== -1) {
        data.active = true;
      }
      return (
        <Node key={index} {...data} />
      )
    });
  }

  render() {
    const select = (
      <Select
        className={s.select}
        value="Entidades"
        options={this.state.selectOptions}
        callback={this.switchOption}
      />
    );

    const items = this.getItems();
    const nodes = this.getNodes();

    return (
      <Widget
        title="Partipación de los Partidos Políticos en %s"
        select={select}
      >

        <Legend
          items={this.state.legendItems}
          hovering={this.state.nodeActive}
          hoverCallback={this.getHoverLegend}
        />

        <div id="chart" hidden></div>

        <div className={s.chartRoot}>
          <svg className={s.chart} width={this.state.chartWidth} height={this.state.chartHeight}>
            <g transform="translate(1,10)">
              <g>
                { items }
              </g>
              <g>
                { nodes }
              </g>
            </g>
          </svg>
          <div className={s.textBox}>
            <span className={s.activeText}>{this.state.activeText}</span>
            <span className={s.activeAmount}>{this.state.activeAmount}</span>
          </div>
        </div>

      </Widget>
    );
  }

  componentWillReceiveProps(nextProps) {
    this.createWidget(nextProps.data);
    if (nextProps.data.length && !this.state.activeAmount) {
      this.setState({activeText: `Seleccione un filtro para ver la participación de los Partidos Políticos en las entidades o en los departamentos. Al hacer clic en cada relación usted podrá ver cuánto es su presupuesto`})
    }
  }

  createWidget(data) {
    d3.sankey = sankeyLib;
    const chart = document.querySelector('#chart');
    chart.innerHTML = "";
    let chartWidth = this.props.width;
    const windowWidth = window.innerWidth - 32;
    if (chartWidth > windowWidth) {
      chartWidth = windowWidth;
    }
    let chartHeight = this.props.height;
    if (chartHeight > (window.innerHeight / 3 * 1.5)) {
      chartHeight = window.innerHeight / 3 * 2;
    }

    this.setState({
      chartHeight: chartHeight + 300,
      chartWidth: chartWidth
    });

    const {nodes, links} = this.formatData(data);

    const width = chartWidth, // was 960
      height = chartHeight; // UBS Example

    const svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    const sankey = d3.sankey()
      .nodeWidth(20) // was 15
      .nodePadding(10) // was 10
      .size([width, height]);

    const path = sankey.link();

    const items = [];
    const nodeEls = [];

    sankey
      .nodes(nodes)
      .links(links)
      .layout(32); // what is this? iterations

    const link = svg.append("g").selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .sort(function (a, b) {
        return b.dy - a.dy;
      })
      .text((d) => {
        const item = d;
        item.path = path(d);
        items.push(item);
      })
      .remove();
    this.setState({items});

    const node = svg.append("g").selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .text((d) => {
        const item = d;
        item.width = d.dy;
        nodeEls.push(item);
      })
      .remove();

    this.setState({nodes: nodeEls});
  }

  formatData(data) {
    const sortBy = this.state.viewType;

    const partidos = [];
    const nodes = [];
    const links = [];

    data.map((el) => {
      let source = el.partido;
      let target = el.entidad;
      console.log(sortBy);
      if (sortBy == "departementos") {
        target = el.departamento;
      }
      const presupuesto = el.presupuestoDeInversion;

      if (presupuesto) {
        let sourceInNodes = false;
        let targetInNodes = false;
        nodes.map((node) => {
          if (node.name == source) sourceInNodes = true;
          if (node.name == target) targetInNodes = true;
        });
        if (!sourceInNodes) {
          nodes.push({name: source, colorPartido: el.colorPartido});
        }
        if (!targetInNodes) nodes.push({name: target});

        let sourceIndex = 0;
        let targetIndex = 0;
        nodes.map((node, index) => {
          node.nodeId = index + 1;
          if (node.name == source) {
            node.type = "partido";
            sourceIndex = index;
          }
          if (node.name == target) {
            targetIndex = index;
          }
          node.presupuesto = presupuesto;
        });

        let linkInLinks = false;
        const value = presupuesto / 1000;
        const result = {"source": sourceIndex, "target": targetIndex, "value": value, "theValue": value};

        links.map((link) => {
          if (link.source === sourceIndex && link.target === targetIndex) {
            link.value += value;
            linkInLinks = true;
          }
        });

        if (!linkInLinks) links.push(result);
      }
    });

    nodes.map((node) => {
      if (node.type == "partido") partidos.push(node);
    });

    this.setState({legendItems: partidos});

    return {nodes, links};
  }

  formatCurrency(x) {
    let number = Math.round(x / 1000000);
    return "$" + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " millones";
  }

}

export default PartipacionWidget;
