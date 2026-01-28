import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamSession } from './schemas/exam.schema';
import { SubmitExamDto } from './dto/exam.dto';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(@InjectModel(Exam.name) private examModel: Model<Exam>) {}

  // USER-FACING: List available published exams
  async findAllPublished(): Promise<Exam[]> {
    try {
      const exams = await this.examModel
        .find({ isPublished: true })
        .select('-questions.correctAnswer -sessions')
        .exec();
      this.logger.log(`Found ${exams.length} published exams`);
      return exams;
    } catch (error) {
      this.logger.error(`Error fetching exams: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch exams');
    }
  }

  // USER-FACING: Get exam details without answers
  async findPublishedById(id: string): Promise<Exam> {
    try {
      const exam = await this.examModel
        .findOne({ _id: id, isPublished: true })
        .select('-questions.correctAnswer -sessions')
        .exec();
      if (!exam) {
        this.logger.warn(`Published exam not found with ID: ${id}`);
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      return exam;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch exam');
    }
  }

  // USER-FACING: Start exam session
  async startExam(examId: string, userId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: examId, isPublished: true }).exec();
      if (!exam) {
        throw new NotFoundException(`Exam with ID ${examId} not found`);
      }

      // Check if user has already started or exceeded max attempts
      const userSessions = exam.sessions.filter((s) => s.userId === userId);
      if (exam.maxAttempts && userSessions.length >= exam.maxAttempts) {
        throw new ConflictException('Maximum attempts reached for this exam');
      }

      // Check if there's an active session (started but not submitted)
      const activeSession = userSessions.find((s) => !s.submittedAt);
      if (activeSession) {
        throw new ConflictException('You already have an active session for this exam');
      }

      const newSession: ExamSession = {
        userId,
        startedAt: new Date(),
        answers: [],
      };

      exam.sessions.push(newSession);
      await exam.save();

      this.logger.log(`Exam session started for user ${userId} on exam ${examId}`);

      // Return exam questions without correct answers
      return {
        examId: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        sessionStartedAt: newSession.startedAt,
        questions: exam.questions.map((q) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          options: q.options,
          marks: q.marks,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      this.logger.error(`Error starting exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to start exam');
    }
  }

  // USER-FACING: Submit exam answers
  async submitExam(examId: string, submitExamDto: SubmitExamDto): Promise<any> {
    try {
      const exam = await this.examModel.findById(examId).exec();
      if (!exam) {
        throw new NotFoundException(`Exam with ID ${examId} not found`);
      }

      const { userId, answers } = submitExamDto;

      // Find active session
      const sessionIndex = exam.sessions.findIndex(
        (s) => s.userId === userId && !s.submittedAt,
      );

      if (sessionIndex === -1) {
        throw new NotFoundException('No active exam session found for this user');
      }

      // Calculate score
      let score = 0;
      const questionMap = new Map(exam.questions.map((q) => [q.questionId, q]));

      answers.forEach((ans) => {
        const question = questionMap.get(ans.questionId);
        if (question && question.correctAnswer === ans.answer) {
          score += question.marks;
        }
      });

      const isPassed = exam.passingScore ? score >= exam.passingScore : true;

      // Update session
      exam.sessions[sessionIndex].answers = answers;
      exam.sessions[sessionIndex].submittedAt = new Date();
      exam.sessions[sessionIndex].score = score;
      exam.sessions[sessionIndex].isPassed = isPassed;

      await exam.save();

      this.logger.log(`Exam submitted by user ${userId} for exam ${examId}. Score: ${score}`);

      return {
        score,
        totalMarks: exam.totalMarks,
        isPassed,
        submittedAt: exam.sessions[sessionIndex].submittedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error submitting exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to submit exam');
    }
  }

  // USER-FACING: Get exam results
  async getExamResults(examId: string, userId: string): Promise<any> {
    try {
      const exam = await this.examModel.findById(examId).exec();
      if (!exam) {
        throw new NotFoundException(`Exam with ID ${examId} not found`);
      }

      const userSessions = exam.sessions.filter(
        (s) => s.userId === userId && s.submittedAt,
      );

      if (userSessions.length === 0) {
        throw new NotFoundException('No completed exam sessions found for this user');
      }

      return {
        examId: exam._id,
        title: exam.title,
        attempts: userSessions.map((session) => ({
          startedAt: session.startedAt,
          submittedAt: session.submittedAt,
          score: session.score,
          totalMarks: exam.totalMarks,
          isPassed: session.isPassed,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error fetching results: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch exam results');
    }
  }
}
