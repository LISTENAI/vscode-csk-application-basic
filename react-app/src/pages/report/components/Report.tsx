import { Tree, Table, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
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
// console.log(data);
interface DataType {
  key: React.Key;
  name: string;
  type: string;
  size: number;
  percent?: string;
}
interface ReportProps {
  data: IMemorySymbol;
}
interface IMemorySymbol extends DataNode {
  name: string;
  address?: string;
  size: number;
  identifier: string;
  file?: string | undefined;
  line?: number | undefined;
  type?: string | undefined;
  children?: Array<IMemorySymbol>;
  isLeaf?: boolean;
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
    if (data) {
      setTreeData([data]);
      setTotal(data.size);
    }
  }, [data]);
  const sorterHandle = (item: any) => {
    return 0;
  };
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
      sorter: sorterHandle,
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
    const node: any = info.node;
    if (node.file) {
      console.log(info.nativeEvent.target)
      const isOpen = (info.nativeEvent.target as any).nodeName === ("svg" || "path");
      isOpen &&
        vscode.postMessage({
          type: "openFile",
          data: { path: node.file, line: node.line },
        });
    }
  };

  const formatSize = (value: number) => {
    return value < 1024 ? `${value} bytes` : `${(value / 1024).toFixed(2)} kb`;
  };
  const sort = (data: Array<DataNode>, order: string) => {
    switch (order) {
      case "ascend":
        data.sort((a: any, b: any) => a.size - b.size);
        break;
      case "descend":
        data.sort((a: any, b: any) => b.size - a.size);
        break;
      default:
        break;
    }
    data.forEach((item) => {
      if (item.children && item.children.length !== 0) {
        sort(item.children, order);
      }
    });
    return data;
  };
  const onChange: TableProps<DataType>["onChange"] = (
    _pagination,
    _filters,
    sorter: any,
    _extra
  ) => {
    if (sorter.order) {
      const newData: Array<DataNode> = sort(dataSource, sorter.order);
      console.log(newData);
      setTreeData([...newData]);
    }
  };

  const nodeRender = (item: any) => {
    return (
      <span className="floder-item">
        <span className="name">
          {item.name}
          {item.file ? (
              <Tooltip title="打开文件">
                <FileAddOutlined />
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
      {/* <p className="total">
        <span>Total</span>
        <span className="total_size">{total}</span>
      </p> */}
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        treeData={dataSource}
        rootClassName="folderTree"
        titleRender={nodeRender}
        icon={iconRender}
        fieldNames={{ title: "name", key: "identifier" }}
      ></DirectoryTree>
    </div>
  );
};

export default Report;
