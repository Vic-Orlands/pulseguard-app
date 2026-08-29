"use client";

import { forwardRef, type ComponentType } from "react";
import type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Archive as ArchiveBase,
  ArrowCounterClockwise,
  ArrowLeft as ArrowLeftBase,
  ArrowRight as ArrowRightBase,
  ArrowClockwise,
  ArrowSquareOut,
  Bell,
  BookmarkSimple,
  Briefcase as BriefcaseBase,
  Bug,
  Buildings,
  Calendar,
  CalendarPlus,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChartBar,
  ChartLineUp,
  ChatCircle,
  Check as CheckBase,
  CheckCircle,
  Circle as CircleBase,
  Clock,
  Code,
  Copy as CopyBase,
  Cpu,
  Cookie,
  Database,
  DownloadSimple,
  Envelope,
  Eye as EyeBase,
  EyeSlash,
  FileCode,
  FileText,
  FloppyDisk,
  FlowArrow,
  FolderPlus as FolderPlusBase,
  Gear,
  GithubLogo,
  Globe,
  GridFour,
  Hash,
  HardDrives,
  House,
  IdentificationCard,
  Image as ImageBase,
  Info,
  Key as KeyBase,
  Lifebuoy,
  Lightning,
  Link as LinkBase,
  List,
  Lock as LockBase,
  MagnifyingGlass,
  MapPin,
  Moon as MoonBase,
  DotsThree,
  DotsThreeVertical,
  Palette,
  Phone,
  Plugs,
  PencilSimple,
  PlayCircle as PlayCircleBase,
  Plus as PlusBase,
  Pulse,
  Question,
  SealCheck,
  ShareNetwork,
  Shield as ShieldBase,
  SignOut,
  SpinnerGap,
  Stack,
  StopCircle as StopCircleBase,
  Sun as SunBase,
  Tag,
  Target,
  Trash,
  TreeStructure,
  TrendUp,
  UploadSimple,
  User as UserBase,
  UserMinus as UserMinusBase,
  UserPlus as UserPlusBase,
  Users as UsersBase,
  UsersThree,
  Warning,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react";

export type PulseIconProps = Omit<IconProps, "weight"> & {
  weight?: IconWeight;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
};

const outlined = (IconComponent: Icon) => {
  const OutlinedIcon = forwardRef<SVGSVGElement, PulseIconProps>(
    ({ weight = "regular", strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
      void strokeWidth;
      void absoluteStrokeWidth;
      return <IconComponent ref={ref} weight={weight} {...props} />;
    },
  );

  OutlinedIcon.displayName = `Outlined${IconComponent.displayName ?? "Icon"}`;
  return OutlinedIcon;
};

export const HugeiconsIcon = ({
  icon: IconComponent,
  className,
  ...props
}: PulseIconProps & { icon: ComponentType<PulseIconProps> }) => (
  <IconComponent
    weight="regular"
    className={cn("text-pg-muted", className)}
    {...props}
  />
);

export const Activity01Icon = outlined(Pulse);
export const Add01Icon = outlined(PlusBase);
export const AiNetworkIcon = outlined(ShareNetwork);
export const Alert01Icon = outlined(Warning);
export const AlertCircleIcon = outlined(WarningCircle);
export const AlertTriangle = outlined(Warning);
export const AnalyticsUpIcon = outlined(TrendUp);
export const Archive = outlined(ArchiveBase);
export const ArrowDown01Icon = outlined(CaretDown);
export const ArrowLeft = outlined(ArrowLeftBase);
export const ArrowLeft01Icon = outlined(CaretLeft);
export const ArrowRight = outlined(ArrowRightBase);
export const ArrowRight01Icon = outlined(CaretRight);
export const ArrowUp01Icon = outlined(CaretUp);
export const BarChart2 = outlined(ChartBar);
export const BarChartIcon = outlined(ChartBar);
export const Bookmark01Icon = outlined(BookmarkSimple);
export const Briefcase = outlined(BriefcaseBase);
export const Bug01Icon = outlined(Bug);
export const Building = outlined(Buildings);
export const Calendar01Icon = outlined(Calendar);
export const CalendarAdd01Icon = outlined(CalendarPlus);
export const Camera01Icon = outlined(Camera);
export const Cancel01Icon = outlined(X);
export const CancelCircleIcon = outlined(XCircle);
export const ChartLineData01Icon = outlined(ChartLineUp);
export const Check = outlined(CheckBase);
export const CheckIcon = outlined(CheckBase);
export const CheckmarkBadge01Icon = outlined(SealCheck);
export const CheckmarkCircle01Icon = outlined(CheckCircle);
export const ChevronDown = outlined(CaretDown);
export const ChevronRight = outlined(CaretRight);
export const ChevronUp = outlined(CaretUp);
export const CircleIcon = outlined(CircleBase);
export const Clock01Icon = outlined(Clock);
export const CodeIcon = outlined(Code);
export const CookieIcon = outlined(Cookie);
export const Copy = outlined(CopyBase);
export const Copy01Icon = outlined(CopyBase);
export const CpuIcon = outlined(Cpu);
export const DatabaseIcon = outlined(Database);
export const Delete02Icon = outlined(Trash);
export const Download01Icon = outlined(DownloadSimple);
export const ExternalLink = outlined(ArrowSquareOut);
export const Eye = outlined(EyeBase);
export const EyeOff = outlined(EyeSlash);
export const FileCog = outlined(FileCode);
export const FileTextIcon = outlined(FileText);
export const FloppyDiskIcon = outlined(FloppyDisk);
export const FolderPlus = outlined(FolderPlusBase);
export const GithubIcon = outlined(GithubLogo);
export const GlobeIcon = outlined(Globe);
export const GridIcon = outlined(GridFour);
export const HashtagIcon = outlined(Hash);
export const HelpCircleIcon = outlined(Question);
export const HierarchyFilesIcon = outlined(TreeStructure);
export const Home = outlined(House);
export const IdentificationCardIcon = outlined(IdentificationCard);
export const Image = outlined(ImageBase);
export const ImageIcon = Image;
export const InformationCircleIcon = outlined(Info);
export const Key = outlined(KeyBase);
export const Key01Icon = outlined(KeyBase);
export const Layers01Icon = outlined(Stack);
export const LifebuoyIcon = outlined(Lifebuoy);
export const Link2 = outlined(LinkBase);
export const LinkSquare01Icon = outlined(ArrowSquareOut);
export const ListViewIcon = outlined(List);
export const Loader2 = outlined(SpinnerGap);
export const LoaderCircle = outlined(SpinnerGap);
export const Loading02Icon = outlined(SpinnerGap);
export const Location01Icon = outlined(MapPin);
export const Lock = outlined(LockBase);
export const LockIcon = outlined(LockBase);
export const LogOut = outlined(SignOut);
export const Logout01Icon = outlined(SignOut);
export const Mail = outlined(Envelope);
export const Mail01Icon = outlined(Envelope);
export const Menu01Icon = outlined(List);
export const Message01Icon = outlined(ChatCircle);
export const Moon = outlined(MoonBase);
export const MoreHorizontalIcon = outlined(DotsThree);
export const MoreVerticalIcon = outlined(DotsThreeVertical);
export const Notification01Icon = outlined(Bell);
export const PaletteIcon = outlined(Palette);
export const PencilEdit01Icon = outlined(PencilSimple);
export const PhoneIcon = outlined(Phone);
export const PlayCircleIcon = outlined(PlayCircleBase);
export const PlugsIcon = outlined(Plugs);
export const Plus = outlined(PlusBase);
export const PlusSignIcon = outlined(PlusBase);
export const Refresh01Icon = outlined(ArrowClockwise);
export const RefreshCcw = outlined(ArrowCounterClockwise);
export const RefreshCw = outlined(ArrowClockwise);
export const Route01Icon = outlined(FlowArrow);
export const Search01Icon = outlined(MagnifyingGlass);
export const Server = outlined(HardDrives);
export const Settings01Icon = outlined(Gear);
export const Shield = outlined(ShieldBase);
export const Shield01Icon = outlined(ShieldBase);
export const StopCircleIcon = outlined(StopCircleBase);
export const Sun = outlined(SunBase);
export const Tag01Icon = outlined(Tag);
export const Target01Icon = outlined(Target);
export const Tick01Icon = outlined(CheckBase);
export const Trash2 = outlined(Trash);
export const UngroupItemsIcon = outlined(TreeStructure);
export const Upload = outlined(UploadSimple);
export const User = outlined(UserBase);
export const UserGroupIcon = outlined(UsersThree);
export const UserIcon = outlined(UserBase);
export const UserMinus = outlined(UserMinusBase);
export const UserPlus = outlined(UserPlusBase);
export const Users = outlined(UsersBase);
export const ViewIcon = outlined(EyeBase);
export const ViewOffIcon = outlined(EyeSlash);
export const WorkflowCircle01Icon = outlined(FlowArrow);
export const Zap = outlined(Lightning);
