import React from 'react';
import d3 from 'd3';
import sankeyLib from '../Sankey/Sankey.js';
import Widget from '../Widget';
import Legend from '../Legend';
import Item from './Item.jsx';
import Node from './Node.jsx';
import Select from '../Select';
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
      linkActive: 999,
      activeText: "",
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

  componentDidMount() {
    window.addEventListener('resize', this.createWidget.bind(this));
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

      if (this.state.linkActive == index) {
        data.active = true;
      }

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
    this.setState({
      activeText: text,
      activeAmount: amount,
      nodeActive: [
        item.source.nodeId,
        item.target.nodeId],
      madeActiveBy: "item",
      linkActive: index
    });
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

    this.setState({
      nodeActive: activeNodes,
      activeText: title,
      activeAmount: this.formatCurrency(value),
      linkActive: 9999
    });
  }

  getHoverLegend(id) {
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

    this.setState({
      nodeActive: [id],
      activeText: title,
      activeAmount: this.formatCurrency(value),
      linkActive: 9999
    });
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

    let textBox;
    if (this.state.activeText) {
      textBox = (
        <div className={s.textBox}>
          <span className={s.activeText}>{this.state.activeText}</span>
          <span className={s.activeAmount}>{this.state.activeAmount}</span>
        </div>
      );
    }

    return (
      <Widget
        upperTitle="Los partidos y sus fichas"
        upperDescription="Sumando entidades y padrinos, los partidos terminan manejando presupuestos importantes. Acá puede ver, por presupuesto de inversión, cuánto mueven por entidad y por región."
        title="Filtre por %s"
        select={select}
        floatTitle
      >
        <div className={s.legend}>
          <Legend
            items={this.state.legendItems}
            hovering={this.state.nodeActive}
            hoverCallback={this.getHoverLegend}
          />
        </div>

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
          {textBox}
        </div>

      </Widget>
    );
  }

  componentWillReceiveProps(nextProps) {
    this.createWidget(nextProps.data);
  }

  createWidget(incommingData) {
    let data = incommingData;
    if (data.length == undefined) {
      data = this.props.data;
    }
    if (!data.length) return;

    d3.sankey = sankeyLib;
    const chart = document.querySelector('#chart');
    chart.innerHTML = "";
    let chartWidth = this.props.width;
    const windowWidth = window.innerWidth - 32;
    if (chartWidth > windowWidth) {
      chartWidth = windowWidth;
    }
    let chartHeight = this.props.height;
    if (chartHeight > (window.innerHeight / 3 * 1.4)) {
      chartHeight = window.innerHeight / 3 * 1.4;
    }
    if (chartHeight < 400) {
      chartHeight = 400;
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
      .nodeWidth(20)
      .nodePadding(10)
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

    const sources = [];
    const nodes = [];
    const links = [];

    data.map((el) => {
      let source = el.partido;
      let target = el.entidad;
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
            node.type = "source";
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
      if (node.type == "source") sources.push(node);
    });

    this.setState({legendItems: sources});

    return {nodes, links};
  }

  formatCurrency(x) {
    let number = Math.round(x / 1000000);
    return "$" + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " millones";
  }

}

export default PartipacionWidget;
