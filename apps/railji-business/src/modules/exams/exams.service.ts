import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Exam } from './schemas/exam.schema';
import { SubmitExamDto, StartExamDto } from './dto/exam.dto';
import { PapersService } from '../papers/papers.service';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    @InjectModel(Exam.name) private examModel: Model<Exam>,
    private papersService: PapersService,
  ) {}

  // Start exam session
  async startExam(startExamDto: StartExamDto): Promise<any> {
    try {
      const { userId, paperId, departmentId } = startExamDto;

      // Generate unique attempt ID
      const examId = randomUUID();

      // Create exam record with initial state
      await this.examModel.create({
        examId,
        userId,
        paperId,
        departmentId,
        responses: [],
        status: 'in-progress',
        startTime: new Date(),
        deviceInfo: {
          device: 'Unknown',
          ipAddress: 'Unknown',
          userAgent: 'Unknown',
        },
      });

      return { examId };
    } catch (error) {
      this.logger.error(`Error starting exam: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Failed to start exam');
    }
  }

  // Submit exam answers
  async submitExam(submitExamDto: SubmitExamDto): Promise<any> {
    try {
      const {
        examId,
        userId,
        paperId,
        departmentId,
        responses,
        attemptedQuestions = 0,
        unattemptedQuestions = 0,
        remarks,
      } = submitExamDto;

      // Find existing exam attempt
      const exam = await this.examModel.findOne({ examId, userId }).exec();
      if (!exam) {
        throw new NotFoundException(
          `Exam attempt with ID ${examId} for ${userId} not found`,
        );
      }

      // Fetch paper
      const paper = await this.papersService.findById(paperId);
      if (!paper) {
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      }

      if (exam.status !== 'in-progress') {
        throw new BadRequestException(
          `Exam ${examId} is already ${exam.status}`,
        );
      }

      // Extract scoring parameters from paper schema
      const maxScore = paper.totalQuestions; // Assuming 1 mark per question
      const passingScore = paper.passMarks;
      const negativeMarkingPenalty = paper.negativeMarking; // Penalty per wrong answer

      // Fetch correct answers from papers service
      const answersData =
        await this.papersService.fetchAnswersForDepartmentPaper(
          departmentId,
          paperId,
        );

      if (!answersData || answersData.length === 0) {
        throw new NotFoundException(`No answers found for paper ${paperId}`);
      }

      // Build a map of correct answers
      const correctAnswersMap = new Map();
      answersData[0].answers.forEach((answer: any) => {
        correctAnswersMap.set(answer.id, answer.correct);
      });

      // Evaluate responses
      let correctAnswers = 0;
      responses.forEach((response) => {
        const correctAnswer = correctAnswersMap.get(response.questionId);
        if (
          correctAnswer !== undefined &&
          response.selectedOption === correctAnswer
        ) {
          correctAnswers++;
        }
      });

      const incorrectAnswers = attemptedQuestions - correctAnswers;

      // Calculate score with negative marking
      const positiveMarks = correctAnswers * 1; // 1 mark per correct answer
      const negativeMarks = incorrectAnswers * negativeMarkingPenalty;
      const score = Math.max(0, positiveMarks - negativeMarks); // Ensure score doesn't go below 0

      const percentage = (score / maxScore) * 100;
      const accuracy =
        attemptedQuestions > 0
          ? (correctAnswers / attemptedQuestions) * 100
          : 0;
      const isPassed = score >= passingScore;

      // Update exam record
      exam.responses = responses;
      exam.totalQuestions = paper.totalQuestions;
      exam.attemptedQuestions = attemptedQuestions;
      exam.unattemptedQuestions = unattemptedQuestions;
      exam.correctAnswers = correctAnswers;
      exam.incorrectAnswers = incorrectAnswers;
      exam.score = score;
      exam.maxScore = maxScore;
      exam.passingScore = passingScore;
      exam.percentage = percentage;
      exam.accuracy = accuracy;
      exam.endTime = new Date();
      exam.status = 'submitted';
      exam.isPassed = isPassed;
      exam.remarks = remarks;

      await exam.save();

      this.logger.log(
        `Exam submitted successfully. Score: ${score}/${maxScore} (${percentage.toFixed(2)}%)`,
      );

      return {
        examId,
        score,
        maxScore,
        passingScore,
        percentage: percentage.toFixed(2),
        accuracy: accuracy.toFixed(2),
        isPassed,
        correctAnswers,
        incorrectAnswers,
        totalQuestions: paper.totalQuestions,
        attemptedQuestions,
        unattemptedQuestions,
        negativeMarking: negativeMarkingPenalty,
        submittedAt: exam.endTime,
      };
    } catch (error) {
      this.logger.error(`Error submitting exam: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Failed to submit exam');
    }
  }
}
