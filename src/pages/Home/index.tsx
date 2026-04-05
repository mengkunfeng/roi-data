import React, { useState, useEffect } from 'react';
import { Select, Radio, Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getAllAppsAPI, getAllCountriesAPI, getROIDataAPI } from '@/services';
import { ROIItem } from '@/types';
import dayjs from 'dayjs';
import { formatNum, formatPercent } from '@/utils/format';

const { Option } = Select;

// 图例可切换的 series 配置（用于 Legend 显示和渲染对应曲线）
const SERIES = [
  { dataKey: '当日(7日均值)', stroke: 'hsl(66,60%,60%)',index:1 },
  { dataKey: '1日(7日均值)', stroke: 'hsl(1,50%,60%)',index:2 },
  { dataKey: '3日(7日均值)', stroke: '#5b8ff9',index:3 },
  { dataKey: '7日(7日均值)', stroke: '#ffadd2',index:4 }, 
  { dataKey: '14日(7日均值)', stroke: '#5ad8a6',index:5 },
  { dataKey: '30日(7日均值)', stroke: '#f6bd16',index:6 },
  { dataKey: '60日(7日均值)', stroke: '#6f5ef9',index:7 },
  { dataKey: '90日(7日均值)', stroke: '#9d2febff',index:8 },
  { dataKey: '预测值', stroke: 'hsl(224, 100%, 76%)', strokeDasharray: '5 5',index:9 },
];

const lengendItem = SERIES.map((item) => item.dataKey);

export default () => {
  // 状态管理
  const [roiData, setRoiData] = useState<ROIItem[]>([]);

  const [averageData, setAverageData] = useState<ROIItem[]>([]);
  const [channel, setChannel] = useState('Apple');
  const [bidType, setBidType] = useState('CPI');
  const [country, setCountry] = useState('美国');
  const [countyList, setCountyList] = useState<{ label: string, value: string }[]>([]);
  const [app, setApp] = useState('App-1');
  const [appList, setAppList] = useState<{ label: string, value: string }[]>([]);
  const [displayMode, setDisplayMode] = useState('original'); // average 或 original
  const [yAxisType, setYAxisType] = useState('log'); // linear 或 log
  const [chartData, setChartData] = useState<any[]>([]);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SERIES.forEach((s) => {
      init[s.dataKey] = false;
    });
    return init;
  });

  // 获取ROI数据
  function getROIData({ country, app }: { country?: string, app?: string }) {
    getROIDataAPI({ country, app }).then(res => {
      const originalData = res.data?.data || [];
      setRoiData(originalData);
      
      // 计算7日移动平均值并设置到 averageData
      const sortedData = [...originalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let averageData = sortedData.map((currentItem, index) => {
        // 计算窗口范围：当前项向前6项（共7项）
        const startIndex = Math.max(0, index - 6);
        const windowData = sortedData.slice(startIndex, index + 1);
        
        // 计算每个ROI指标的平均值
        const averages = windowData.reduce((acc, item,index) => {
          Object.keys(item).forEach(key => {
            if (key.startsWith('roi') && !isNaN(Number(item[key]))) {
              acc[key] = ((acc[key] || 0) + Number(item[key]))/2;
            }
            if (index === windowData.length - 1) {
              if (key.startsWith('roi')) {
                acc[key] = item[key] ? acc[key] : item[key];
              }
            }
          });
          return acc;
        }, {} as Record<string, number>);

        console.log(currentItem,averages);
        
        // 计算平均值
        const averageItem = { ...currentItem , ...averages};
        return averageItem;
      });
      
      setAverageData(averageData);
    });
  }

  // 请求数据
  useEffect(() => {
    // 获取默认数据
    getROIData({ country, app });
    // 获取所有国家列表
    getAllCountriesAPI().then(res => {
      setCountyList(res.data?.data || []);
    });

    // 获取所有APP列表  
    getAllAppsAPI().then(res => {
      setAppList(res.data?.data || []);
    });
  }, []);
  
  // 生成90天的日期
  // 更新图表数据
  useEffect(() => {
    if (!roiData || roiData.length === 0) {
      setChartData([]);
      return;
    }

    // 按日期排序
    let sortedData = [...roiData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(averageData);

    if (displayMode === 'average') {
       sortedData = [...averageData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // 组合图表数据，将字符串转换为数字
    const data = sortedData.map((item, index) => {
      // 计算前7天roi90的平均值作为预测值
      const startIndex = Math.max(0, index - 6);
      const windowData = sortedData.slice(startIndex, index + 1);

      let count = 0
      let roi0Average = windowData.reduce((sum, windowItem) => {
        if (windowItem.roi0) {
          count++
          return sum + (parseFloat(windowItem.roi0 as any) || 0);
        }
        return sum;
      }, 0);
      roi0Average = roi0Average / count;
      
      const baseData = {
        date: dayjs(item.date).format('YYYY-MM-DD'),
        '当日(7日均值)': formatNum(item.roi0),
        '1日(7日均值)': formatNum(item.roi1),     
        '3日(7日均值)': formatNum(item.roi3),
        '7日(7日均值)': formatNum(item.roi7), 
        '14日(7日均值)': formatNum(item.roi14),
        '30日(7日均值)': formatNum(item.roi30),
        '60日(7日均值)': formatNum(item.roi60),
        '90日(7日均值)': formatNum(item.roi90),
        '预测值': formatNum(roi0Average)
      };

      // 处理对数刻度的0值问题
      if (yAxisType === 'log') {
        const processedData:any = { ...baseData };
        Object.keys(processedData).forEach(key => {
          if (key !== 'date' && processedData[key] === 0) {
            processedData[key] = 0.00000001; // 替换0为很小的正数
          }
        });
        return processedData;
      }

      return baseData;
    });

    setChartData(data);
  }, [roiData, displayMode, yAxisType]);
    
  
  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatPercent(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Legend 可点击：切换对应 Line 的显示/隐藏
  const renderClickableLegend = (props: any) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;
    payload.sort((a: any, b: any) => {
      const indexA = lengendItem.indexOf(a.dataKey ?? a.value);
      const indexB = lengendItem.indexOf(b.dataKey ?? b.value);
      return indexA - indexB;
    });
    

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          width: '100%',
          paddingBottom: 2,
        }}
      >
        {payload.map((entry: any) => {
          const key = entry.dataKey ?? entry.value;
          const isHidden = !!hiddenSeries[key];

          return (
            <span
              key={key}
              role="button"
              tabIndex={0}
              onClick={() =>
                setHiddenSeries((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setHiddenSeries((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }));
                }
              }}
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                userSelect: 'none',
                opacity: isHidden ? 0.45 : 1,
                textDecoration: isHidden ? 'line-through' : 'none',
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: entry.color,
                  marginRight: 6,
                  opacity: isHidden ? 0.55 : 1,
                }}
              />
              <span>{entry.value}</span>
            </span>
          );
        })}
      </div>
    );
  };
  
  return (
    <div>      
      <div style={{ padding: '20px' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{app} - 多时间维度ROI趋势</h2>
          <p style={{ color: '#6b7280' }}>(7日移动平均)</p>
          <p style={{ color: '#374151'}}>数据范围:最近90天</p>
        </div>
        
        {/* 筛选控制区域 */}
        <Card style={{ marginBottom: '20px' }}>
          {/* 第一行筛选器 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>用户安装渠道：</span>
              <Select 
                value={channel}
                style={{ width: 150 }} 
                onChange={setChannel}
              >
                <Option value="Apple">Apple</Option>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>出价类型：</span>
              <Select 
                value={bidType}
                style={{ width: 150 }} 
                onChange={setBidType}
              >
                <Option value="CPI">CPI</Option>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>国家地区：</span>
              <Select 
                value={country}
                style={{ width: 150 }}
                onChange={(val) => {
                  setCountry(val);
                  getROIData({ country: val, app });
                }}
                options={countyList}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>APP：</span>
              <Select 
                value={app}
                style={{ width: 150 }} 
                onChange={(val) => {
                  setApp(val);
                  getROIData({ country, app: val });
                }}
                options={appList}
              />
            </div>
          </div>
          
          {/* 第二行控制器 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '10px' }}>
              <span style={{ marginRight: '16px' }}>数据显示模式：</span>
              <Radio.Group value={displayMode} onChange={(e) => setDisplayMode(e.target.value)}>
                <Radio value="average">显示移动平均值</Radio>
                <Radio value="original">显示原始数据</Radio>
              </Radio.Group>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '10px' }}>
              <span style={{ marginRight: '16px' }}>Y轴刻度：</span>
              <Radio.Group value={yAxisType} onChange={(e) => setYAxisType(e.target.value)}>
                <Radio value="linear">线性刻度</Radio>
                <Radio value="log">对数刻度</Radio>
              </Radio.Group>
            </div>
          </div>
        </Card>
        
        {/* 图表区域 */}
        <div style={{ width: '100%', height: '600px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                interval={6}
              />
              <YAxis 
                type="number"
                scale={yAxisType === 'log' ? 'log' : 'auto'}
                domain={yAxisType === 'log' ? [0.0001, 10] : ['auto', 'auto']}
                ticks={yAxisType === 'log' ? [0.001,0.01, 0.1, 1, 10] : undefined}
                allowDecimals={yAxisType === 'log'}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value*100}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={48}
                content={renderClickableLegend}
              />
              {SERIES.map((s) => {
                const isHidden = !!hiddenSeries[s.dataKey];

                return (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.dataKey}
                    stroke={s.stroke}
                    strokeWidth={2}
                    dot={false}
                    hide={isHidden}
                    strokeDasharray={(s as any).strokeDasharray}
                  />
                );
              })}
              <ReferenceLine 
                y={1} 
                stroke="#ff4d4f" 
                strokeWidth={2}
                label={{ 
                  value: '100%回本线', 
                  position: 'insideTopRight',
                  style: { fill: '#ff4d4f', fontWeight: 'bold', fontSize: 12 }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

