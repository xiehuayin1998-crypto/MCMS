// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Building2, User, LogOut, ChevronDown, Bell, Car, Users, Settings, Calendar, Home, MessageSquare, AlertCircle, X, FileText, BookOpen, Image, Shield, Info } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { PermissionButton } from '@/components/PermissionButton';
export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [showBusinessMenu, setShowBusinessMenu] = React.useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = React.useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  // 轮播图相关状态
  const [carouselImages, setCarouselImages] = React.useState([]);
  const [carouselConfig, setCarouselConfig] = React.useState({
    intervalTime: 5000,
    showIndicators: true,
    autoPlay: true
  });

  // 通知数据
  const notifications = [{
    id: 1,
    title: '系统维护通知',
    content: '系统将于本周六凌晨2:00-4:00进行维护升级',
    type: 'warning',
    time: '2024-12-20 10:00'
  }, {
    id: 2,
    title: '新功能上线',
    content: '会议室预订系统已正式上线，欢迎使用',
    type: 'info',
    time: '2024-12-19 15:30'
  }, {
    id: 3,
    title: '安全提醒',
    content: '请定期修改密码，确保账户安全',
    type: 'alert',
    time: '2024-12-18 09:00'
  }];

  // 根据通知类型获取图标
  const getNotificationIcon = type => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // 检查用户权限
  React.useEffect(() => {
    checkUserPermission();
  }, []);

  // 加载轮播图数据
  React.useEffect(() => {
    loadCarouselData();
  }, []);

  // 检查通知显示状态
  React.useEffect(() => {
    checkNotificationStatus();
  }, []);

  // 轮播图自动切换
  React.useEffect(() => {
    if (carouselConfig.autoPlay && carouselImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % carouselImages.length);
      }, carouselConfig.intervalTime);
      return () => clearInterval(interval);
    }
  }, [carouselImages, carouselConfig.autoPlay, carouselConfig.intervalTime]);

  // 检查用户权限
  const checkUserPermission = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        setIsAdmin(userInfo.isAdmin || false);
        setCurrentUser(userInfo);
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('检查权限失败:', error);
      setIsAdmin(false);
      setCurrentUser(null);
    }
  };

  // 检查通知显示状态
  const checkNotificationStatus = () => {
    try {
      const seenStatus = localStorage.getItem('hasSeenNotifications');
      const currentUser = localStorage.getItem('currentUser');
      if (!seenStatus && currentUser) {
        // 首次登录，显示通知
        setShowNotifications(true);
      } else {
        // 已看过通知，不显示
        setShowNotifications(false);
      }
      setHasSeenNotifications(!!seenStatus);
    } catch (error) {
      console.error('检查通知状态失败:', error);
      setShowNotifications(false);
    }
  };

  // 标记通知为已查看
  const markNotificationsAsSeen = () => {
    try {
      localStorage.setItem('hasSeenNotifications', 'true');
      setHasSeenNotifications(true);
      setShowNotifications(false);
    } catch (error) {
      console.error('标记通知状态失败:', error);
    }
  };

  // 加载轮播图数据
  const loadCarouselData = async () => {
    try {
      // 从 mc_lunbotu_management 数据模型获取轮播图数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_lunbotu_management',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          filter: {
            where: {
              isActive: {
                $eq: true
              }
            }
          },
          orderBy: [{
            sortOrder: 'asc'
          }]
        }
      });
      if (result && result.records && result.records.length > 0) {
        const carouselsData = result.records;
        setCarouselImages(carouselsData);
        // 设置轮播配置（使用第一条记录的间隔时间作为默认配置）
        if (carouselsData.length > 0) {
          setCarouselConfig({
            intervalTime: carouselsData[0].intervalTime || 5000,
            showIndicators: true,
            autoPlay: true
          });
        }
      } else {
        // 如果没有数据，使用默认轮播图
        setCarouselImages([{
          _id: 'default',
          title: '欢迎访问墨西哥轨道交通装备有限公司',
          imageUrl: 'cloud://cloud1-1gpy146l61301e65.636c-cloud1-1gpy146l61301e65-1300768879/lunbotu/default-banner.jpg',
          linkUrl: '',
          description: '专业的轨道交通装备解决方案提供商',
          sortOrder: 1,
          isActive: true,
          intervalTime: 5000
        }]);
      }
    } catch (error) {
      console.error('加载轮播图数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载轮播图数据，请稍后重试",
        variant: "destructive"
      });

      // 使用默认轮播图作为备用
      setCarouselImages([{
        _id: 'default',
        title: '欢迎访问墨西哥轨道交通装备有限公司',
        imageUrl: 'cloud://cloud1-1gpy146l61301e65.636c-cloud1-1gpy146l61301e65-1300768879/lunbotu/default-banner.jpg',
        linkUrl: '',
        description: '专业的轨道交通装备解决方案提供商',
        sortOrder: 1,
        isActive: true,
        intervalTime: 5000
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理轮播图切换
  const handleSlideChange = index => {
    setCurrentSlide(index);
  };

  // 处理轮播图点击
  const handleCarouselClick = carousel => {
    if (carousel.linkUrl) {
      window.open(carousel.linkUrl, '_blank');
    }
  };

  // 处理导航菜单点击
  const handleNavigationClick = (type, item) => {
    if (type === 'business') {
      switch (item) {
        case 'vehicle':
          // 车辆管理：在新标签页中打开外部网站
          window.open('https://cloud1-1gpy146l61301e65-1300768879.tcloudbaseapp.com/app-6s8hfp2p/production/', '_blank');
          break;
        case 'meeting':
          $w.utils.navigateTo({
            pageId: 'meetingRoomBooking',
            params: {}
          });
          break;
        case 'plan':
          toast({
            title: "计划管理",
            description: "正在进入计划管理系统"
          });
          break;
        default:
          break;
      }
    } else if (type === 'company') {
      if (!isAdmin) {
        toast({
          title: "权限不足",
          description: "您没有权限访问公司信息管理功能",
          variant: "destructive"
        });
        return;
      }
      switch (item) {
        case 'employee':
          $w.utils.navigateTo({
            pageId: 'employeeManagement',
            params: {}
          });
          break;
        case 'department':
          $w.utils.navigateTo({
            pageId: 'departmentManagement',
            params: {}
          });
          break;
        case 'permission':
          $w.utils.navigateTo({
            pageId: 'permissionManagement',
            params: {}
          });
          break;
        case 'carousel':
          $w.utils.navigateTo({
            pageId: 'carouselManagement',
            params: {}
          });
          break;
        default:
          break;
      }
    } else if (type === 'document') {
      switch (item) {
        case 'regulation':
          $w.utils.navigateTo({
            pageId: 'regulationManagement',
            params: {
              category: '规章制度'
            }
          });
          break;
        case 'quality':
          $w.utils.navigateTo({
            pageId: 'qualitySystem',
            params: {
              category: '质量体系'
            }
          });
          break;
        case 'safety':
          $w.utils.navigateTo({
            pageId: 'safetyEnvironmentSystem',
            params: {
              category: '安环体系'
            }
          });
          break;
        default:
          break;
      }
    }
    setShowBusinessMenu(false);
    setShowCompanyMenu(false);
    setShowDocumentMenu(false);
  };

  // 处理公司信息管理点击
  const handleCompanyClick = () => {
    if (!isAdmin) {
      toast({
        title: "权限不足",
        description: "您没有权限访问公司信息管理功能",
        variant: "destructive"
      });
      return;
    }
    setShowCompanyMenu(!showCompanyMenu);
    setShowBusinessMenu(false);
    setShowDocumentMenu(false);
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在加载...</p>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-50" style={style}>
    {/* 使用统一的用户信息栏组件 */}
    <UserHeader $w={$w} showHomeButton={false} />

    {/* 轮播图区域 - 宽度缩小30%，使用max-w-4xl(896px)替代原来的max-w-full(1280px) */}
    <div className="relative w-full max-w-7xl mx-auto h-48 bg-gray-100 overflow-hidden">
      {carouselImages.length > 0 ? carouselImages.map((carousel, index) => <div key={carousel._id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
        <img src={carousel.imageUrl} alt={carousel.title} className="w-full h-full object-cover cursor-pointer" onClick={() => handleCarouselClick(carousel)} onError={e => {
          e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop';
        }} />
        {/* 移除了左下角信息显示，只保留渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>) : <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无轮播图</h3>
          <p className="text-sm text-gray-500">请在轮播图管理中添加轮播图</p>
        </div>
      </div>}

      {/* 轮播图指示器 - 调整位置以适应新宽度 */}
      {carouselConfig.showIndicators && carouselImages.length > 1 && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, index) => <button key={index} onClick={() => handleSlideChange(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`} />)}
      </div>}
    </div>

    {/* 导航栏 */}
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 左侧导航项 */}
          <div className="flex items-center space-x-8">
            <button onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="flex items-center text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5 mr-2" />
              首页
            </button>

            {/* 业务功能管理 */}
            <div className="relative">
              <button onClick={() => {
                setShowBusinessMenu(!showBusinessMenu);
                setShowCompanyMenu(false);
                setShowDocumentMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                业务功能管理
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showBusinessMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('business', 'meeting')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  会议室预定
                </button>
                <button onClick={() => handleNavigationClick('business', 'vehicle')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  车辆管理
                </button>
                {/* <button onClick={() => handleNavigationClick('business', 'plan')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    计划管理
                   </button> */}
              </div>}
            </div>

            {/* 管理文件 */}
            <div className="relative">
              <button onClick={() => {
                setShowDocumentMenu(!showDocumentMenu);
                setShowBusinessMenu(false);
                setShowCompanyMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                管理文件
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showDocumentMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('document', 'regulation')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  规章制度
                </button>
                <button onClick={() => handleNavigationClick('document', 'quality')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  质量体系
                </button>
                <button onClick={() => handleNavigationClick('document', 'safety')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  安环体系
                </button>
              </div>}
            </div>

            {/* 个人工作台 */}
            <div className="relative">
              <button onClick={() => $w.utils.navigateTo({
                pageId: 'personalDashboard',
                params: {}
              })} className="flex items-center text-gray-700 hover:text-gray-900">
                个人工作台
              </button>
            </div>
          </div>

          {/* 右侧公司信息管理 - 仅管理员可点击，调整至最右边 */}
          {isAdmin && <div className="relative">
            <button onClick={handleCompanyClick} className="flex items-center text-gray-700 hover:text-gray-900">
              公司信息管理
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showCompanyMenu && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button onClick={() => handleNavigationClick('company', 'employee')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <User className="w-4 h-4 mr-2" />
                员工管理
              </button>
              <button onClick={() => handleNavigationClick('company', 'department')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                部门管理
              </button>
              <button onClick={() => handleNavigationClick('company', 'permission')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                权限管理
              </button>
              {/* <button onClick={() => handleNavigationClick('company', 'role')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    角色管理
                  </button>
                  <button onClick={() => handleNavigationClick('company', 'carousel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    轮播图管理
                  </button> */}
            </div>}
          </div>}
        </div>
      </div>
    </nav>

    {/* 通知信息框 - 仅在首次登录时显示 */}
    {showNotifications && <div className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-lg border z-40">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">通知公告</h3>
        <button onClick={markNotificationsAsSeen} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notification => <div key={notification.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
            </div>
          </div>
        </div>)}
      </div>
    </div>}
  </div>;
}