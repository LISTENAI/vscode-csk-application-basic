import { Tree, Table, Tooltip } from "antd";
import React, { useState,useEffect } from "react";
import type { DirectoryTreeProps, DataNode } from "antd/es/tree";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  FileOutlined,
  FunctionOutlined,
  ForkOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
// const data = require("../ram.json");
// console.log(data);
interface DataType {
  key: React.Key;
  name: string;
  type: string;
  size: number;
  percent?: string;
}
interface ReportProps {
  data: {
    symbols?: any;
    total_size: number;
  };
}
const { DirectoryTree } = Tree;
const Report: React.FC<ReportProps> = (props) => {
  const { data } = props;
  const [dataSource, setTreeData] = useState<DataNode[]>([]);
  const [total, setTotal] = useState<number>(0);
  // const [tableData, setTableData] = useState<any>([
  //   { name: "Total", size: data.total_size, type: "", percent: "" },
  // ]);
  useEffect(() => {
    console.log(123)
    if (data) {
      setTreeData(data.symbols);
      setTotal(data.total_size);
    }
  }, [data]);
  const sorterHandle = () => {
    
  }
  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 100,
      align: "left",
    },

    {
      title: "Size",
      dataIndex: "size",
      defaultSortOrder: "descend",
      // sorter: sorterHandle,
      width: 100,
      align: "left",
    },
    {
      title: "%",
      dataIndex: "percent",
      width: 100,
      align: "right",
    },
  ];


  const onSelect: DirectoryTreeProps["onSelect"] = (keys, info) => {
    const node:any = info.node;
    if (["file", "function", "variable"].includes(node.type)) {
      const isSvg = (info.nativeEvent.target as any).nodeName === "svg";
      console.log(node);
      isSvg && vscode.postMessage({
          type: "openFile",
          data: { path: node.identifier,line:node.line },
        });
      }
  };

  const onExpand: DirectoryTreeProps["onExpand"] = (keys, info) => {
  };

  const formatSize = (value: number) => {
    return value < 1024 ? `${value} bytes` : `${(value / 1024).toFixed(2)} kb`;
  };
  const onChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter:any,
    extra
  ) => {
    
    console.log("params", sorter.order);
  };

  const nodeRender = (item:any) => {
    return (
      <span className="floder-item">
        <span className="name">
          {item.name}
          {["file", "function", "variable"].includes(item.type) ? (
            <Tooltip title="打开文件">
              <FileAddOutlined/>
            </Tooltip>
          ) : (
            ""
          )}
        </span>
        <span className="ram_type">{item.type} </span>
        <span className="size">{formatSize(item.size)}</span>
        <span className="percent">
          {((item.size / total) * 100).toFixed(2)} %
        </span>
      </span>
    );
  };
  const iconRender = (item: any) => {
    switch (item.type) {
      case "function":
        return <FunctionOutlined />;
      case "variable":
        return <ForkOutlined />;
      case "file":
        return <FileOutlined />;
      default:
        if (item.expanded) {
          return <FolderOpenOutlined />;
        } else {
          return <FolderOutlined />;
        }
    }
  };
  return (
    <div className="tree-container">
      <Table columns={columns} onChange={onChange}></Table>
      <p className="total">
        <span>Total</span>
        <span className="total_size">{total}</span>
      </p>
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData = { dataSource }
        rootClassName="folderTree"
        titleRender={nodeRender}
        icon={iconRender}
        fieldNames={{ title: "name", key: "identifier" }}
      ></DirectoryTree>
    </div>
  );
};

export default Report;
